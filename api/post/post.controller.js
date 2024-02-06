const postService = require('./post.service.js');
const socketService = require('../../services/socket.service.js');

const logger = require('../../services/logger.service.js');

async function getPosts(req, res) {
    try {
        logger.debug('Getting Posts');
        const filterBy = req.query;
        const posts = await postService.query(filterBy);
        res.json(posts);
    } catch (err) {
        logger.error('Failed to get posts', err);
        res.status(500).send({ err: 'Failed to get posts' });
    }
}

async function getPostById(req, res) {
    try {
        const postId = req.params.id;
        const post = await postService.getById(postId);
        res.json(post);
    } catch (err) {
        logger.error('Failed to get post', err);
        res.status(500).send({ err: 'Failed to get post' });
    }
}

async function addPost(req, res) {
    const { loggedinUser } = req;

    try {
        const post = req.body;
        // post.owner = loggedinUser;
        const addedPost = await postService.add(post);

        // socketService.broadcast({
        //     type: 'post-added',
        //     data: post,
        //     userId: loggedinUser._id,
        // });
        // socketService.emitToUser({type: 'review-about-you', data: review, userId: review.aboutUser._id})
        res.json(addedPost);
    } catch (err) {
        logger.error('Failed to add post', err);
        res.status(500).send({ err: 'Failed to add post' });
    }
}

async function updatePost(req, res) {
    try {
        const post = req.body;
        const updatedPost = await postService.update(post);
        res.json(updatedPost);
    } catch (err) {
        logger.error('Failed to update post', err);
        res.status(500).send({ err: 'Failed to update post' });
    }
}

async function removePost(req, res) {
    try {
        const postId = req.params.id;
        const removedId = await postService.remove(postId);
        res.send(removedId);
    } catch (err) {
        logger.error('Failed to remove post', err);
        res.status(500).send({ err: 'Failed to remove post' });
    }
}

async function addPostMsg(req, res) {
    const { loggedinUser } = req;
    try {
        const postId = req.params.id;
        const msg = {
            txt: req.body.txt,
            by: loggedinUser,
        };
        const savedMsg = await postService.addPostMsg(postId, msg);
        res.json(savedMsg);
    } catch (err) {
        logger.error('Failed to update post', err);
        res.status(500).send({ err: 'Failed to update post' });
    }
}

async function removePostMsg(req, res) {
    const { loggedinUser } = req;
    try {
        const postId = req.params.id;
        const { msgId } = req.params;

        const removedId = await postService.removePostMsg(postId, msgId);
        res.send(removedId);
    } catch (err) {
        logger.error('Failed to remove post msg', err);
        res.status(500).send({ err: 'Failed to remove post msg' });
    }
}


module.exports = {
    getPosts,
    getPostById,
    addPost,
    updatePost,
    removePost,
    addPostMsg,
    removePostMsg,
};
