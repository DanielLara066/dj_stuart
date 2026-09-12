import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../api/reviews.js';
const env = { DATABASE_URL: 'test', REVIEW_RATE_LIMIT_SECRET: 'test-secret' };
function response() { return { headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(n) { this.code=n;return this; }, json(data) { this.data=data;return this; } }; }
const valid = {name:'Pessoa teste',rating:5,comment:'Uma experiência excelente.',website:''};
function req(method='POST', body=valid) { return {method,body,headers:{'content-type':'application/json',host:'portfolio.test',origin:'https://portfolio.test'},socket:{remoteAddress:'127.0.0.1'}}; }
test('missing configuration never reports a saved review',async()=>{const res=response();await createHandler({env:{}})(req(),res);assert.equal(res.code,503);assert.ok(res.data.error);});
test('invalid fields are rejected before database access',async()=>{for(const body of [{...valid,rating:6},{...valid,rating:'5'},{...valid,name:' '},{...valid,comment:'a'},{...valid,website:'spam'},'invalid json']){const res=response();await createHandler({env,connect:()=>{throw Error('must not run');}})(req('POST',body),res);assert.equal(res.code,400);}});
test('cross-origin writes are rejected',async()=>{const r=req();r.headers.origin='https://other.test';const res=response();await createHandler({env})(r,res);assert.equal(res.code,403);});
test('database errors remain errors with no details exposed',async()=>{const res=response();await createHandler({env,connect:()=>async()=>{throw Error('secret');}})(req(),res);assert.equal(res.code,503);assert.ok(!JSON.stringify(res.data).includes('secret'));});
test('read and write return confirmed database rows; SQL is parameterized',async()=>{const row={id:'id',...valid,created_at:new Date().toISOString()};let captured;const handler=createHandler({env,connect:()=>async(strings,...values)=>{captured={strings,values};return [row];}});const res=response();await handler(req('POST',{...valid,name:"O'Connor"}),res);assert.equal(res.code,201);assert.equal(res.data.review.id,'id');assert.ok(captured.values.includes("O'Connor"));assert.ok(!captured.strings.join('').includes("O'Connor"));const get=response();await handler(req('GET'),get);assert.deepEqual(get.data.reviews,[row]);});
test('rate limited writes return 429 instead of false success',async()=>{const res=response();await createHandler({env,connect:()=>async()=>[]})(req(),res);assert.equal(res.code,429);assert.equal(res.headers['Retry-After'],'60');});
