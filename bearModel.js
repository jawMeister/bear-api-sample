import mongoose from 'mongoose';

let bearModel = mongoose.Schema({
    name: {
        type: String
    },
    type: {
        type: String
    }
});

export default mongoose.model('Bear', bearModel);
