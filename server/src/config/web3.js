const logger = require("./logger");
var Web3 = require("web3");

// console.log("LP", process.env.INFURA_WEB3_URL);

var _web3 = new Web3(
  new Web3.providers.HttpProvider(process.env.INFURA_WEB3_URL)
  // Web3.givenProvider
);

// instantiating web socket infura connection
var provider = new Web3.providers.WebsocketProvider(
  process.env.INFURA_WEB3SOCKET_URL
);
var web3Socket = new Web3(provider);

//listening on websocket provider for errors and "BREAKING CONNECTIONS", and then reconnecting
provider.on("error", (e) => {
  logger.info("Infura websocket error");
  logger.error(new Error(e));
});
provider.on("end", (e) => {
  logger.info("Infura Websocket connection broken");
  logger.info("Attempting to reconnect...");
  provider = new Web3.providers.WebsocketProvider(
    process.env.INFURA_WEB3SOCKET_URL
  );
  setTimeout(function () {
    provider.on("connect", function () {
      logger.info("Reconnected to Infura Websocket");
    });
  }, 2);
  setTimeout(function () {
    web3Socket.setProvider(provider);
  }, 2);
});

module.exports = { _web3, web3Socket };
