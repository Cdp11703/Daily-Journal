const { Router } = require('express');

const Posts = require('../models/Posts.js');
const Archives = require('../models/Archives.js');
const path = require('path');
const fs = require('fs');

const router = Router();

const homeStartingContent = "Good luck on your Final Exam. Merry Christmas and Happy New Year to Everyone!";
const aboutContent 	  = "Luke 16:10-14 ERV"
const contactContent      = "MCO3: December 5, 2023; Grade Consulation Day: December 14, 2023";

router.use((req, res, next) => {
  res.locals.header = 'content from header.hbs'; // You may want to replace this with actual header data
  res.locals.footer = 'content from footer.hbs'; // You may want to replace this with actual footer data
  next();
});


function truncateContent(content, length) {
    if (content.length > length) {
      return content.substring(0, length) + '...';
    }
    return content;
}

router.get('/', async (req, res) => {
    try {
      const posts = await Posts.find();
      const truncatedPosts = posts.map(post => ({
        ...post.toObject(),
        content: truncateContent(post.content, 100),
      }));
      
      res.render('home', { homeStartingContent, posts: truncatedPosts });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
});

router.get('/compose', (req, res) => {
    res.render('compose');
});

router.post('/compose', async (req, res) => {
    console.log('Received POST request to /compose'); // Add this line
    const { title, content } = req.body;

    try {
        const currentDate = new Date();
        const post = new Posts({
            title,
            content,
            createdAt: currentDate,
            updatedAt: currentDate,
        });

        await post.save();


        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/post', async (req, res) => {
    try {
        const posts = await Posts.find();
        res.render('post', { post });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/post/:postId', async (req, res) => {
    const postId = req.params.postId;
  
    try {
      const post = await Posts.findById(postId);
      console.log('Post:', post); // Check the structure of the post object
  
      if (!post) {
        return res.status(404).send('Post not found');
      }
  
      res.render('post', { post });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
});

router.get('/about', (req, res) => {
    try {
        res.render('about', {aboutContent});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/contact', (req, res) => {
    try {
        res.render('contact', {contactContent});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/edit/:postId', async (req, res) => {
    const postId = req.params.postId;

    try {
        const post = await Posts.findById(postId).lean();
        console.log("Title:",post.title);
        console.log("Description:",post.content);

        if (!post) {
            // Handle case where post is not found
            return res.status(404).send('Post not found');
        }

        res.render('edit', { post });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/update/:postId', async (req, res) => {
    const postId = req.params.postId;
    const { title, content } = req.body;

    try {
        const post = await Posts.findById(postId);
        post.title = title;
        post.content = content;
        await post.save();

        res.redirect('/post/' + postId);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/delete/:postId', async (req, res) => {
    const postId = req.params.postId;

    try {
        // Find and archive the post
        const post = await Posts.findById(postId);
        const archivedPost = new Archives({
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        });
        await archivedPost.save();

        // Remove the post from the Posts collection
        await Posts.findOneAndDelete({ _id: postId });

        res.redirect('/');
         
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
