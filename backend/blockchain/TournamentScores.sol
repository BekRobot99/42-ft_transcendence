// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TournamentScores {
    struct ScoreEntry {
        uint256 matchId;
        address player1;
        address player2;
        uint256 score1;
        uint256 score2;
        address winner;
        uint256 timestamp;
    }

    mapping(uint256 => ScoreEntry[]) public scoresByTournament;
    
    event ScoreSaved(
        uint256 indexed tournamentId,
        uint256 indexed matchId,
        address indexed player1,
        address player2,
        uint256 score1,
        uint256 score2,
        address winner,
        uint256 timestamp
    );

    function saveScore(
        uint256 tournamentId,
        uint256 matchId,
        address player1,
        address player2,
        uint256 score1,
        uint256 score2,
        address winner
    );
}