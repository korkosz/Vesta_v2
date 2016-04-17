import Ideas from '/imports/api/ideas/idea';

class ReviewsCollection extends Mongo.Collection {
    insert(review, callback) {
        super.insert(review, function (err, res) {
            //TODO: obsluzyc callback pierwotny
            Ideas.update({ _id: review._ideaId }, {
                $push: { reviews: res }
            });
            return res;
        });
    }

    //TODO: ZMIENIC REVID NA SELECTOR
    remove(revId, ideaId) {
        if(typeof ideaId === 'undefined') throw new Error('ideaId is undefined !!!')
        if(typeof revId === 'undefined') throw new Error('revId is undefined !!!')
        
        super.remove(revId, function (err, res) {
            console.log(revId, ideaId);
            Ideas.update({ _id: ideaId }, {
                $pull: { reviews: revId }
            });
        });
    }
}

export default Reviews = new ReviewsCollection('Reviews')

ReviewSchema = new SimpleSchema({
    _ideaId: {
        type: String
    },
    comment: {
        type: String,
        optional: true
    },
    merits: {
        type: [String],
        optional: true
    },
    drawbacks: {
        type: [String],
        optional: true
    },
    _createdBy: {
        type: String
    }
});

Reviews.attachSchema(ReviewSchema);