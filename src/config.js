// List names of providers that should participate in the race
const PARTICIPANTS = [
    'chainstack',
    'alchemy', 
    'quickNode',
    // 'kaleido',
    'infura', 
]
const NETWORK = 1
const SAVE_PATH = './logs/results.csv'

module.exports = { PARTICIPANTS, NETWORK, SAVE_PATH }
