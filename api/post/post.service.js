const dbService = require("../../services/db.service")
const logger = require("../../services/logger.service")
const utilService = require("../../services/util.service")
const ObjectId = require("mongodb").ObjectId

async function query(filterBy = { tag: "" }) {
    try {
        const criteria = _buildCriteria(filterBy)
        const page = filterBy.page || 0
        const postPerPage = 38
        const collection = await dbService.getCollection("post")
        const posts = await collection
            .find(criteria)
            .sort(
                filterBy.order === "likes"
                    ? { userLiked: -1 }
                    : filterBy.order === "new"
                    ? { createdAt: -1 }
                    : { createdAt: 1 }
            )
            .skip(page * postPerPage)
            .limit(postPerPage)
            .toArray()

        const length = await collection.countDocuments(criteria)
        return { posts, length }
    } catch (err) {
        logger.error("cannot find posts", err)
        throw err
    }
}

async function getById(postId) {
    try {
        const collection = await dbService.getCollection("post")
        const post = collection.findOne({ _id: ObjectId(postId) })
        return post
    } catch (err) {
        logger.error(`while finding post ${postId}`, err)
        throw err
    }
}

async function remove(postId) {
    try {
        const collection = await dbService.getCollection("post")
        await collection.deleteOne({ _id: ObjectId(postId) })
        return postId
    } catch (err) {
        logger.error(`cannot remove post ${postId}`, err)
        throw err
    }
}

async function add(post) {
    try {
        post.userLiked = []
        post.comments = []
        post.createdAt = Date.now()
        const collection = await dbService.getCollection("post")
        await collection.insertOne(post)
        return post
    } catch (err) {
        logger.error("cannot insert post", err)
        throw err
    }
}

async function update(post) {
    try {
        const postToSave = JSON.parse(JSON.stringify(post))
        delete postToSave._id
        const collection = await dbService.getCollection("post")

        await collection.updateOne(
            { _id: ObjectId(post._id) },
            { $set: postToSave }
        )
        return post
    } catch (err) {
        logger.error(`cannot update post ${postId}`, err)
        throw err
    }
}

async function addPostComment(postId, comment) {
    try {
        comment._id = utilService.makeId()
        comment.createdAt = new Date()
        const collection = await dbService.getCollection("post")
        await collection.updateOne(
            { _id: ObjectId(postId) },
            { $push: { comments: comment } }
        )
        return comment
    } catch (err) {
        logger.error(`cannot add post msg ${postId}`, err)
        throw err
    }
}

async function removePostMsg(postId, msgId) {
    try {
        const collection = await dbService.getCollection("post")
        await collection.updateOne(
            { _id: ObjectId(postId) },
            { $pull: { msgs: { id: msgId } } }
        )
        return msgId
    } catch (err) {
        logger.error(`cannot add post msg ${postId}`, err)
        throw err
    }
}
async function deleteAll() {
    const collection = await dbService.getCollection("post")
    collection.deleteMany({})
}
// deleteAll()
function _buildCriteria({ tag, order, isDraft }) {
    const criteria = {}
    if (tag) {
        criteria.tags = { $elemMatch: { $eq: tag } }
    }

    if (isDraft) {
        criteria.isDraft = { $eq: false }
    }
    // if (name) {
    //     criteria.name = { $regex: name, $options: "i" }
    // }

    // if (type) {
    //     criteria.type = { $regex: type, $options: "i" }
    // }

    // if (amenities && amenities.length) {
    //     criteria.amenities = {
    //         $in: amenities.split(",").map((a) => new RegExp(a, "ig")),
    //     }
    // }

    // if (roomTypes && roomTypes.length) {
    //     criteria.roomType = { $in: roomTypes.split(",") }
    // }

    // if (maxPrice || minPrice) {
    //     criteria.price = { $gte: +minPrice || 0, $lte: +maxPrice || Infinity }
    // }

    // if (destination) {
    //     criteria["loc.country"] = { $regex: destination, $options: "i" }
    // }

    // if (propertyTypes && propertyTypes.length) {
    //     criteria.proprtyType = { $in: propertyTypes.split(",") }
    // }

    // if (guests) {
    //     criteria.capacity = { $gte: +guests }
    // }

    // if (bathrooms) {
    //     criteria.bathrooms = { $gte: +bathrooms }
    // }

    // if (bedrooms) {
    //     criteria.bedrooms = { $gte: +bedrooms }
    // }

    // if (beds) {
    //     criteria.beds = { $gte: +beds }
    // }

    return criteria
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    addPostComment,
    removePostMsg,
}
