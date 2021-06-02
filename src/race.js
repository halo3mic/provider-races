const csvWriter = require('csv-write-stream')
const ethers = require('ethers')
const fs = require('fs')

const { PARTICIPANTS, NETWORK, SAVE_PATH } = require('./config')
const providers= require('../providers.json')


var LAST_BLOCK = 0  // Heighest block number seen so far
var BEST_TIME = 0  // Timestamp when the latest block was first seen
var POSITIONS = []  // Providers' results for latest block sorted by time of arrival

/**
 * Display results for a provider in the terminal
 * @param {Object} info Results from race for one of the providers
 */
function outputStream(info) {
    let msg = [info.blockNumber, info.place, info.providerName, info.latency].join(' :: ')
    if (info.place == 1) {
        console.log('\n' + '='.repeat(50) + '\n')
    }
    console.log(msg)
}

/**
 * Save an array as rows to csv file.
 * @param {array} data Data that is stored
 * @param {string} path Path to the file where data is stored
 */
function saveToCsv(data, path) {
    if (data.length==0) {
        return
    }
    let writer = csvWriter()
    let headers = {sendHeaders: false}
    if (!fs.existsSync(path))
        headers = {headers: Object.keys(data[0])}
    writer = csvWriter(headers);
    writer.pipe(fs.createWriteStream(path, {flags: 'a'}));
    data.forEach(e => writer.write(e))
    writer.end()
}

/**
 * Process new block recieved from a provider. 
 * @dev There is a chance that two blocks  at the same time 
 * @param {number} blockNumber 
 * @param {string} providerName
 */
function handleNewBlock(blockNumber, providerName) {
    let oldPositions
    let timestamp = Date.now()
    let providerSeen = POSITIONS.map(p=>p.providerName).includes(providerName)
    if (blockNumber > LAST_BLOCK) {
        // Reset environment
        BEST_TIME = timestamp
        LAST_BLOCK = blockNumber
        oldPositions = [...POSITIONS]
        POSITIONS = []
    } else if (blockNumber<LAST_BLOCK || blockNumber==LAST_BLOCK&&providerSeen) {
        // Don't log stale block
        return
    }
    let latency = timestamp - BEST_TIME  // In ms
    let result = { 
        blockNumber, 
        providerName,
        timestamp: timestamp, 
        place: POSITIONS.length + 1, 
        latency: latency
    }
    POSITIONS.push(result)  // Save in memory
    outputStream(result)  // Print results
    // Save on disk results for previous block
    if (oldPositions) {
        saveToCsv(oldPositions, SAVE_PATH)
    }
}

/**
 * Set a new WebSocket provider. 
 * @param {string} uri 
 * @param {number} network
 */
function setWsProvider(uri, network) {
    let wsProvider = new ethers.providers.WebSocketProvider(
        uri,
        network
    )
    wsProvider.on('error', async (error) => {
        console.log(`provider:${uri}:error\n`, error)
    })
    return wsProvider
}

/*
 * Start listening for new blocks on all listed providers. 
 */
function startRace() {
    console.log('🏁 Race started! Waiting for a new block ...')
    for (let provider of providers) {
        if (PARTICIPANTS.includes(provider.name)) {
            setWsProvider(provider.uri, NETWORK).on(
                'block', 
                blockNumber => handleNewBlock(blockNumber, provider.name)
            )
        }
    }
}

startRace()
