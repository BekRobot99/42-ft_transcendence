import { config } from 'dotenv';
import { ethers } from 'ethers';

config();

const RPC_URL = process.env.FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.TOURNAMENT_CONTRACT_ADDRESS;

const ABI = [
  'function saveScore(uint256 tournamentId,uint256 matchId,address player1,address player2,uint256 score1,uint256 score2,address winner) external',
  'function getScores(uint256 tournamentId) view returns (tuple(uint256 matchId,address player1,address player2,uint256 score1,uint256 score2,address winner,uint256 timestamp)[])',
  'event ScoreSaved(uint256 indexed tournamentId,uint256 indexed matchId,address indexed player1,address player2,uint256 score1,uint256 score2,address winner,uint256 timestamp)'
];

if (!PRIVATE_KEY) throw new Error('BLOCKCHAIN_PRIVATE_KEY is required');
if (!CONTRACT_ADDRESS) throw new Error('TOURNAMENT_CONTRACT_ADDRESS is required');

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
