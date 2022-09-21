const { writeFile } = require("fs");
const { join } = require("path");
const request = require("request");
const blend = require("@mapbox/blend");
const argv = require("minimist")(process.argv.slice(2));

const baseUrl = "https://cataas.com/cat/says/";

const {
  greeting = "Hello",
  who = "You",
  width = 400,
  height = 500,
  color = "Pink",
  size = 100,
} = argv;

const requestBody = (name) => {
  return {
    url: `${baseUrl}/${name}?width=${width}&height=${height}&color=${color}&s=${size}`,
    encoding: "binary",
  };
};

const handleRequest = (data) => {
  return new Promise((resolve, reject) => {
    request(data, (error, res, body) => {
      if (!error && res.statusCode === 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
};

const combineImages = (firstImage, secoundImage) => {
  blend(
    [
      { buffer: new Buffer.from(firstImage, "binary"), x: 0, y: 0 },
      { buffer: new Buffer.from(secoundImage, "binary"), x: width, y: 0 },
    ],
    { width: width * 2, height: height, format: "jpeg" },
    (err, data) => {
      if (err) {
        throw err;
      }

      const fileOut = join(process.cwd(), `/cat-card.jpg`);

      writeFile(fileOut, data, "binary", (err) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log("The file was saved!");
      });
    }
  );
};

(async () => {
  try {
    const requests = [handleRequest(requestBody(greeting)), handleRequest(requestBody(who))];
    const [firstImage, secoundImage] = await Promise.all(requests);
    combineImages(firstImage, secoundImage);
  } catch (err) {
    console.log(err);
    return;
  }
})();
