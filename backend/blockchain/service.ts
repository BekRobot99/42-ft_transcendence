import { config } from 'dotenv';
import { ethers } from 'ethers';

config();

const RPC_URL = process.env.FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.TOURNAMENT_CONTRACT_ADDRESS;