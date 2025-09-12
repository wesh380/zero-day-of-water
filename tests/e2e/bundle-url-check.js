const http = require('http');
const { spawn } = require('child_process');

(async()=>{
  const port = process.env.TEST_PORT || 8091;
  const srv = spawn('npx',['http-server','docs','-p',String(port),'-s','-c-1'],{stdio:'ignore',shell:true});
  function get(u){ return new Promise((ok,ko)=>http.get(u,res=>ok(res)).on('error',ko)); }
  setTimeout(async ()=>{
    try{
      const url = `http://localhost:${port}/assets/dist/water-cld.bundle.js`;
      const res = await get(url);
      console.log('bundle status:', res.statusCode);
      srv.kill();
      process.exit(res.statusCode===200?0:1);
    }catch(e){
      try{ srv.kill(); }catch(_){}
      console.error('bundle check error:', e && (e.stack||e.message||e));
      process.exit(1);
    }
  }, 600);
})();

