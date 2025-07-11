import { MetadataRoute } from 'next';
// import { getAllPosts } from '@/lib/blog'; // You need to implement this function

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // const posts = await getAllPosts();

    // const postEntries: MetadataRoute.Sitemap = posts.map((post: { slug: string; date: string }) => ({
    //     url: `https://mejabidurotimi.com/blog/${post.slug}`,
    //     lastModified: new Date(post.date),
    //     changeFrequency: 'monthly',
    //     priority: 0.8,
    // }));

    return [
        {
            url: 'https://mejabidurotimi.com',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: 'https://mejabidurotimi.com/about',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: 'https://mejabidurotimi.com/contact',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        // Add other static pages as needed
        // ...postEntries,
    ];
} 