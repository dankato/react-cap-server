'use strict';

const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  text: {type: String},
  created: {type: Date, default: Date.now}
});

postSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    text: this.text,
    created: this.created
  };
};

const commentSchema = mongoose.Schema({
  text: {type: String},
  created: {type: Date, default: Date.now}
});

commentSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    commentText: this.commentText,
    created: this.created
  };
};

const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Post, Comment;