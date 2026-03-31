/**
 * Lazada DOM Selectors Registry
 */

module.exports = {
    product: {
        name: '.pdp-mod-product-badge-title',
        price: '.pdp-price_type_normal',
        originalPrice: '.pdp-price_type_deleted',
        description: '.detail-content',
        images: '.item-gallery__thumbnail img',
        rating: '.score-average',
        reviewCount: '.pdp-review-summary__link',
        soldCount: '.pdp-product-sold',
    },

    shop: {
        name: '.seller-name__name',
        avatar: '.seller-avatar img',
        followerCount: '.seller-followers',
        productCount: '.seller-products',
        rating: '.seller-rating',
    },

    search: {
        resultItem: '[data-qa-locator="product-item"]',
        resultLink: 'a',
        resultName: '.title',
        resultPrice: '.price',
        resultImage: 'img',
    },
};
