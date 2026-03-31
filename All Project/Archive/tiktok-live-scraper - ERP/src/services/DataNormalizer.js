/**
 * DataNormalizer - Normalize data across platforms to unified schema
 */

class DataNormalizer {
    /**
     * Normalize product data
     */
    static normalizeProduct(rawData, platform) {
        return {
            platform,
            platformId: rawData.id || rawData.platformId || null,
            shopId: rawData.shopId || rawData.shop_id || null,
            name: rawData.name || '',
            description: rawData.description || '',
            brand: rawData.brand || null,
            category: rawData.category || null,
            categoryPath: rawData.categoryPath || rawData.category_path || null,
            price: parseFloat(rawData.price) || 0,
            originalPrice: parseFloat(rawData.originalPrice || rawData.original_price || rawData.price) || 0,
            discountPercent: parseFloat(rawData.discountPercent || rawData.discount_percent) || 0,
            currency: rawData.currency || 'THB',
            rating: parseFloat(rawData.rating) || 0,
            ratingCount: parseInt(rawData.ratingCount || rawData.rating_count) || 0,
            reviewCount: parseInt(rawData.reviewCount || rawData.review_count) || 0,
            soldCount: parseInt(rawData.soldCount || rawData.sold_count) || 0,
            viewCount: parseInt(rawData.viewCount || rawData.view_count) || 0,
            favoriteCount: parseInt(rawData.favoriteCount || rawData.favorite_count) || 0,
            stock: parseInt(rawData.stock) || 0,
            isInStock: rawData.isInStock !== false,
            shippingFee: parseFloat(rawData.shippingFee || rawData.shipping_fee) || 0,
            freeShipping: Boolean(rawData.freeShipping || rawData.free_shipping),
            estimatedDelivery: rawData.estimatedDelivery || rawData.estimated_delivery || null,
            images: Array.isArray(rawData.images) ? rawData.images : [],
            thumbnail: rawData.thumbnail || (rawData.images && rawData.images[0]) || null,
            videoUrl: rawData.videoUrl || rawData.video_url || null,
            variants: Array.isArray(rawData.variants) ? rawData.variants : [],
            variantCount: parseInt(rawData.variantCount || rawData.variant_count) || 0,
            url: rawData.url || '',
            isOfficial: Boolean(rawData.isOfficial || rawData.is_official),
            scrapedAt: new Date(),
        };
    }

    /**
     * Normalize review data
     */
    static normalizeReview(rawData, platform) {
        return {
            platform,
            author: rawData.author || 'Anonymous',
            rating: parseInt(rawData.rating) || 0,
            comment: rawData.comment || '',
            images: Array.isArray(rawData.images) ? rawData.images : [],
            variantInfo: rawData.variantInfo || rawData.variant_info || null,
            isVerifiedPurchase: Boolean(rawData.isVerifiedPurchase || rawData.is_verified_purchase),
            helpfulCount: parseInt(rawData.helpfulCount || rawData.helpful_count) || 0,
            sellerResponse: rawData.sellerResponse || rawData.seller_response || null,
            sellerResponseAt: rawData.sellerResponseAt || rawData.seller_response_at || null,
            reviewedAt: rawData.reviewedAt || rawData.reviewed_at || new Date(),
            scrapedAt: new Date(),
        };
    }

    /**
     * Normalize shop data
     */
    static normalizeShop(rawData, platform) {
        return {
            platform,
            platformShopId: rawData.id || rawData.platformShopId || null,
            name: rawData.name || '',
            logo: rawData.logo || rawData.avatar || null,
            url: rawData.url || '',
            location: rawData.location || null,
            rating: parseFloat(rawData.rating) || 0,
            productCount: parseInt(rawData.productCount || rawData.product_count) || 0,
            followerCount: parseInt(rawData.followerCount || rawData.follower_count) || 0,
            responseRate: parseFloat(rawData.responseRate || rawData.response_rate) || 0,
            responseTime: rawData.responseTime || rawData.response_time || null,
            joinedDate: rawData.joinedDate || rawData.joined_date || null,
            isOfficial: Boolean(rawData.isOfficial || rawData.is_official),
            isVerified: Boolean(rawData.isVerified || rawData.is_verified),
            scrapedAt: new Date(),
        };
    }
}

module.exports = DataNormalizer;
