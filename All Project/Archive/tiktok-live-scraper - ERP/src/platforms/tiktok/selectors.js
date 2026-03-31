/**
 * TikTok DOM Selectors Registry
 */

module.exports = {
    // Live Stream selectors
    live: {
        commentContainer: '[data-e2e="comment-item"]',
        commentAuthor: '[data-e2e="comment-username"]',
        commentText: '[data-e2e="comment-text"]',
        commentTime: 'time',
        viewerCount: '[data-e2e="live-viewer-count"]',
        likeCount: '[data-e2e="live-like-count"]',
    },

    // Product page selectors (TikTok Shop)
    product: {
        name: 'h1[data-e2e="product-title"]',
        price: '[data-e2e="product-price"]',
        originalPrice: '[data-e2e="product-original-price"]',
        description: '[data-e2e="product-description"]',
        images: '[data-e2e="product-image"]',
        rating: '[data-e2e="product-rating"]',
        reviewCount: '[data-e2e="review-count"]',
        soldCount: '[data-e2e="sold-count"]',
        stock: '[data-e2e="stock-count"]',
        addToCart: '[data-e2e="add-to-cart"]',
    },

    // Shop page selectors
    shop: {
        name: '[data-e2e="shop-name"]',
        avatar: '[data-e2e="shop-avatar"]',
        followerCount: '[data-e2e="follower-count"]',
        productCount: '[data-e2e="product-count"]',
        rating: '[data-e2e="shop-rating"]',
    },

    // Search page selectors
    search: {
        resultItem: '[data-e2e="search-result-item"]',
        resultLink: 'a[data-e2e="search-result-link"]',
        resultName: '[data-e2e="search-result-title"]',
        resultPrice: '[data-e2e="search-result-price"]',
        resultImage: '[data-e2e="search-result-image"]',
    },
};
