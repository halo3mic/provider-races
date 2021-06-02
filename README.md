# Provider Races
The purpose of this module is to get a better insight into the time-performance of the Ethereum Web3 providers. Multiple providers can be listened at once and performance of each logged for the block. Logging includes printing results in terminal and saving them in csv file.



## Terminal output
For each block performance of provider is ranked and displayed in the terminal. 
Each line displays block number, provider's place for that block and by how many ms was it slower than the best provider for that block. **Late results are not displayed.**

Example of terminal output can be seen below:
```
11868902 :: 1 :: chainstackAsia :: 0
11868902 :: 2 :: chainstackUsa :: 32
11868902 :: 3 :: chainstackBlocklytics :: 752
11868902 :: 4 :: infura :: 1130
11868902 :: 5 :: alchemy :: 2920
```

## Logging
If local block height is increased and there are results from previous block then these results are stored on the disk. **Late results are not stored.**

The parameters stored for each provider are:
 * **blockNumber**, 
 * **providerName**, 
 * **timestamp** - Local timestamp in ms when block was received, 
 * **place** - In which place did the provider end up
 * **latency** - how many ms was the provider slower than the first one

Default storage path is in `logs/results.csv` and example of stored data can be seen below.

| blockNumber | providerName | timestamp | place | latency
 | ----------- | ----------- | ----------- | ----------- |  -----------
11868726 |	chainstackUsa |	1.61349E+12 |	1 |	0
11868726 |	chainstackAsia |	1.61349E+12 |	2 |	143
11868726 |	infura |	1.61349E+12 |	3 |	1205
11868726 |	chainstackBlocklytics |	1.61349E+12 |	4 |	1826
11868726 |	alchemy |	1.61349E+12 |	5 |	3014


## Usage
To install the required packages run
```
npm i
```
In root folder add file `providers.json` to specify the providers and their URIs. See `example.providers.json` to see the format one should follow.

To start the race run
```
npm run race
```
or
```
node ./src/race.js
```

## Configurations
In `config.js` user can specify where results are stored, which network is used and which providers from `providers.json` should participate in the race.
To add a new provider put it's uri and name in `providers.json`.

## Note 

There is a chance for collision of results. When a new block height is detected certain variables need to be updated and whilst this takes place another provider could also detect a new block. Since it takes less than 1 ms for the update to happen the chance of this happening is very low.
