import React from "react";
import "./Blog.css";

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: "🍔 How We Make Fresh Burgers",
      excerpt:
        "We only use farm-fresh ingredients and cook everything to order...",
    },
    {
      id: 2,
      title: "🍕 Why Our Pizza is Special",
      excerpt: "Stone-baked, hand-tossed, and made with love...",
    },
    {
      id: 3,
      title: "🥗 Fresh Salads for Every Season",
      excerpt:
        "Healthy, crunchy, and packed with flavor for all salad lovers...",
    },
  ];

  return (
    <div id="blog" className="blog-section">
      <h2>Our Blog</h2>
      <p className="blog-intro">
        Welcome to our website! We’re dedicated to providing the best services
        and solutions tailored to your needs. Explore our latest posts below.
      </p>

      <div className="blog-grid">
        {posts.map((post) => (
          <div key={post.id} className="blog-card">
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <button className="read-more">Read More</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
