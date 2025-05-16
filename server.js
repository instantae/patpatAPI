
(async function() { 

	// server stuff
  const fetch = require("node-fetch");
  const URL = require('url').Url;
  const { Readable } = require('stream');
  const express = require("express"); 
	const app = express();
    
	// patpat stuff
	const path = require('path');
	const _ = require('lodash');
  const fs = require('fs');

	const GIFEncoder = require('gifencoder');
	const Canvas = require('canvas');

	const FRAMES = 10;

	const petGifCache = [];

	const defaultOptions = {
    resolution: 128,
    delay: 25,
    backgroundColor: null,
	};  
	
  app.use(express.static('./'));
  
  app.get("/", (request, response) => {

    let avatarURL = request.query.avatarURL;
    
    response.send(`<div>usage: https://${process.env.PROJECT_DOMAIN}.glitch.me/patpat?avatarURL={URL}</div>`);
    
  });
  
  app.get("/stayalive", async (request, response) => {
    console.log('stayalive ping');
    
    // const fetchResponse = await fetch(`https://${process.env.PROJECT_DOMAIN}.glitch.me/falke_tae.gif`);
    // fetchResponse.body.pipe(response);
      response.send(`https://${process.env.PROJECT_DOMAIN}.glitch.me/falke_tae.gif`);
    
  });  
  
	app.get("/patpat", async (request, response) => {

    // const reqURL = new URL('http://' + request.hostname + request.originalUrl);

    console.log(request.query);
    // console.log(request.protocol + '://' + request.hostname + request.originalUrl);
    
    let avatarURL = request.query.avatarURL;
    console.log(avatarURL);
    let userid = request.query.userid;
    console.log(userid);


    let options = {};

    options = _.defaults(options, defaultOptions); // Fill in the default option values

    // Create GIF encoder
    const encoder = new GIFEncoder(options.resolution, options.resolution);

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(options.delay);
    encoder.setTransparent();

    // Create canvas and its context
    const canvas = Canvas.createCanvas(options.resolution, options.resolution);
    const ctx = canvas.getContext('2d');

    const avatar = await Canvas.loadImage(avatarURL);

    // Loop and create each frame
    for (let i = 0; i < FRAMES; i++) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (options.backgroundColor) {
        ctx.fillStyle = options.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const j = i < FRAMES / 2 ? i : FRAMES - i;

      const width = 0.8 + j * 0.02;
      const height = 0.8 - j * 0.05;
      const offsetX = (1 - width) * 0.5 + 0.1;
      const offsetY = (1 - height) - 0.08;

      if (i == petGifCache.length) petGifCache.push(await Canvas.loadImage(`https://cdn.glitch.global/da6c9f1f-fd6a-435d-b177-4696b743cee3/pet${i}.gif`));

      ctx.drawImage(avatar, options.resolution * offsetX, options.resolution * offsetY, options.resolution * width, options.resolution * height);
      ctx.drawImage(petGifCache[i], 0, 0, options.resolution, options.resolution);

      encoder.addFrame(ctx);
    }

    encoder.finish();
    let result = encoder.out.getData();
    
    const stream = fs.createWriteStream('patpat.gif');
    stream.once('open', function(fd) {
      stream.write(result);
      stream.end();
    });
    
    fs.writeFileSync(`${userid}.gif`, result, function (err) {});
    
    const params = new URLSearchParams();
    params.append('api_key', `MhlaTx8nIyf2wAms5OeAtMYSfTcAOK2V`);
    params.append('username', 'instantae');
    params.append('source_image_url', `https://${process.env.PROJECT_DOMAIN}.glitch.me/${userid}.gif`);
    params.append('tags', userid);
    
    console.log(params);
    
    //const giphy = await fetch('https://upload.giphy.com/v1/gifs',{method: 'POST', body: params});
    //const data = await giphy.text();
    //console.log(data);
    
    
    //response.set("content-disposition", `attachment; filename=${userid}.gif`);  
    //response.redirect(`https://${process.env.PROJECT_DOMAIN}.glitch.me/${userid}.gif`);
    const fetchResponse = await fetch(`https://${process.env.PROJECT_DOMAIN}.glitch.me/${userid}.gif`);
    fetchResponse.body.pipe(response);

    // response.send(`https://${process.env.PROJECT_DOMAIN}.glitch.me/${userid}.gif`);
});
  
   
	const listener = app.listen(process.env.PORT, () => {
		console.log("Your app is listening on https://" + process.env.PROJECT_DOMAIN + ".glitch.me/ port: " + listener.address().port);
	});
  
})();
