import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';
import {sanityClient, urlFor} from '../sanity';
import {Post} from '../typings';
import Header from '../components/Header';
import { url } from 'inspector';

interface Props {
  posts: [Post];
}

const Home = ({posts}: Props) => {
  // Sort posts by date
  {posts.sort((a, b) => {
    return new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime();
  })};
  return (
    <div className=" max-w-7xl mx-auto">
      <Head>
        <title>Pedium Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header/>

      <div className='flex justify-between items-center bg-yellow-400 border-y border-black py-10 lg:py-0'>
        <div className='px-10 space-y-5'>
          <h1 className='text-6xl max-w-xl font-serif'>
            <span className='underline decoration-black decoration-4'>Pedium</span>{" "}
             is a place to write, read, and connect
          </h1>
          <h2>
            It's easy and free to post your thinking on any topic and connect
            with millions of readers.
          </h2>
        </div>

      <img className='hidden md:inline-flex h-48 lg:h-full' src="https://cdn.discordapp.com/attachments/972007130792075304/972013948327063652/Paul_Logo_Letter.png" />
      </div>

      {/* Posts */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 lg:p-6'>
        {posts.map(post => (
          <Link key={post._id} href={`/post/${post.slug.current}`}>
            <div className='border rounded-lg group cursor-pointer overflow-hidden'>
              <img className=' h-60 w-full object-cover group-hover:scale-105 transition-transform ease-in-out duration-200' src={urlFor(post.mainImage).url()!} alt=""/>
              <div className='flex justify-between p-4 bg-white'>
                <div className='px-2'>
                  <p className='font-bold text-lg'>{post.title}</p>
                  <p className='text-xs'>{post.description} by <span className=' text-green-600 font-bold'>{post.author.name}</span></p>
                </div>
                <img className=' h-16 w-16 rounded-full' src={urlFor(post.author.image).url()!} alt=""/>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
    </div>
  )
}

// Server Side Rendering
export const getServerSideProps = async () => {
  const query = `
  *[_type == 'post'] {
    _id,
    title,
    _createdAt,
    author -> {
    name,
    image
    },
   description,
   mainImage,
   slug,
  }`;

  const posts = await sanityClient.fetch(query);
  return {
    props: {
      posts,
    }
  }
};

export default Home
