import {sanityClient, urlFor} from '../../sanity';
import {GetStaticProps} from 'next';
import Header from '../../components/Header';
import {Post} from '../../typings';
import { useForm, SubmitHandler } from 'react-hook-form';
import PortableText from 'react-portable-text';
import {useState} from 'react';
import Head from 'next/head';

interface IFormInput {
    _id: string;
    name: string;
    email: string;
    comment: string;
}

interface Props {
    post: Post;
}


function Post ({post}: Props) {

    const [submitted, setSubmitted] = useState(false);

    const {register, handleSubmit, formState: {errors}} = useForm<IFormInput>();
    const onSubmit: SubmitHandler<IFormInput> = (data) => {
        fetch('/api/createComment', {
            method: 'POST',
            body: JSON.stringify(data),
        }).then(() => {
            console.log("Data: ", data);
            setSubmitted(true);
        }).catch(err => {
            console.log(err);
            setSubmitted(false);
        });
    };
    return(
        <main>
            <Head>
                <title>{post.title}</title>
            </Head>
            <Header />
            <img className='w-full h-44 object-cover'
            src={urlFor(post.mainImage).url()!} alt=""/>

            <article className=' max-w-3xl mx-auto p-5'>
                <h1 className='text-3xl mt-10 mb-3'>{post.title}</h1>
                <h2 className='text-xl font-light text-gray-500'>{post.description}</h2>

                <div className='flex items-center space-x-3'>
                    <img className='h-10 w-10 rounded-full'
                    src={urlFor(post.author.image).url()!} alt=""/>
                    <p className=' font-extralight text-sm'>Blog post by <span className=' text-green-600'>{post.author.name}</span>
                    - Published at {new Date(post._createdAt).toLocaleString()} </p>
                </div>

                <div className='mt-10'>
                    <PortableText 
                    className=''
                    dataset= {process.env.NEXT_PUBLIC_SANITY_DATASET}
                    projectId= {process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
                    content={post.body}
                    serializers={{
                        h1: (props: any) => (
                            <h1 className='text-2xl font-bold my-5' {...props}/>
                        ),
                        h2: (props: any) => (
                            <h2 className='text-xl font-bold my-5' {...props}/>
                        ),
                        li: ({children}: any) => (
                            <li className='ml-5 list-disc'>{children}</li>
                        ),
                        link: ({children, href}: any) => (
                            <a className='text-blue-600' href={href}>{children}</a>
                        ),}}
                    />
                </div>
            </article>

            <hr className=' max-w-lg my-5 mx-auto border border-yellow-300'/>
            
            {/* If form submitted, show diff page, else, we show them the form */}
            {submitted ? 
            <div className='flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto'>
                <h3 className=' text-3xl font-bold'>Thank you for submitting your comment!</h3>
                <p>Once it has been approved, it will appear below :)</p>
            </div>
            : 
            (<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col p-5 mb-10 max-w-xl mx-auto'>
                <h4 className=' text-3xl font-bold'>Leave a comment below!</h4>
                <hr className='py-3 mt-2'/>
                <input
                {...register("_id")}
                type='hidden'
                name='_id'
                value={post._id}
                />
                <label className=' block mb-5'>
                    <span className=' text-gray-600'>Name</span>
                    <input {...register("name", {required: true})} className=' shadow border rounded px-3 py-2 form-input mt-1 block w-full ring-yellow-500 focus:ring outline-none' placeholder='Paulito' type='text'/>
                </label>
                <label className=' block mb-5'>
                    <span className=' text-gray-600'>Email</span>
                    <input {...register("email", {required: true})} className=' shadow border rounded px-3 py-2 form-input mt-1 block w-full ring-yellow-500 focus:ring outline-none' placeholder='something@gmail.com' type='email'/>
                </label>
                <label className=' block mb-5'>
                    <span className=' text-gray-600'>Comment</span>
                    <textarea {...register("comment", {required: true})} required maxLength={250} className='shadow border rounded px-3 py-3 form-textarea mt-1 block w-full ring-yellow-500 focus:ring outline-none' placeholder='Start commenting!' rows={8}/>
                </label>

                {/* Errors will return when field validations fail */}
                <div className='flex flex-col p-5'>
                    {errors.name && <p className='text-red-500'>Name is required</p>}
                    {errors.email && <p className='text-red-500'>Email is required</p>}
                    {errors.comment && <p className='text-red-500'>Comment is required</p>}
                </div>
                <input type="submit" className=' shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 rounded curser-pointer'/>
            </form>)
            }
            {/* Comments */}
            <div className='flex flex-col p-10 my-10 max-w-2xl mx-auto shadow shadow-yellow-400 space-y-2'>
                <h3 className=' text-4xl'>Comments</h3>
                <hr className=' pb-4'/>

                {post.comments.map(comment => (
                    <div key={comment._id}>
                        <p>
                            <span className=' text-yellow-500'>{comment.name}</span> : {comment.comment}
                        </p>
                    </div>
                ))}
                
            </div>
        </main>
    )
}

export default Post;

export const getStaticPaths = async () => {
    const query = `
    *[_type == 'post'] {
        _id,
        slug {
            current
        }
    }`;

    const posts = await sanityClient.fetch(query);

    const paths = posts.map((post: Post) => ({
        params: {
            slug: post.slug.current
        }
    }));

    return{
        paths,
        fallback: 'blocking',
    };
}

export const getStaticProps: GetStaticProps = async ({params}) => {
    const query =`
    *[_type == 'post' && slug.current== $slug][0]{
        _id,
        _createdAt,
        title,
        author -> {
         name,
         image,
        },
        'comments': *[
            _type == 'comment' && 
            post._ref == ^._id &&
            approved == true
        ],
        description,
        mainImage,
        slug,
        body,
      }
    `;

    const post = await sanityClient.fetch(query, {
        slug: params?.slug
    });
    
    if(!post) {
        return {
            notFound: true
        }
    }

    return {
        props: {
            post,
        },
        revalidate: 10,
    }

}