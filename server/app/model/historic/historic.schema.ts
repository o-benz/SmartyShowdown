import * as mongoose from 'mongoose';

export const historicGameSchema = new mongoose.Schema({
    gameName: { type: String, required: true },
    date: { type: String, required: true },
    nPlayers: { type: Number, required: true },
    bestScore: { type: Number, required: true },
});
