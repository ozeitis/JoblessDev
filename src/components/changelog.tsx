import { basehub } from "basehub"
import { Pump } from "basehub/react-pump"
import { RichText } from "basehub/react-rich-text"
import type { Metadata } from "next"
import Image from 'next/image';

export const revalidate = 60
export const dynamic = "force-static"

export async function generateMetadata(): Promise<Metadata> {
  const { blog } = await basehub({
    next: { revalidate: 60 },
    draft: false,
  }).query({
    blog: { meta: { title: true, description: true, ogImage: { url: true } } },
  })

  return {
    title: blog.meta.title,
    description: blog.meta.description,

  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}


const ChangeLog = async () => {
  return (
    <Pump
      next={{ revalidate: 60 }}
      queries={[
        {
          blog: {
            header: { title: true, subtitle: true },
            posts: {
              __args: { first: 10, orderBy: "publishDate__DESC" },
              items: {
                _id: true,
                _title: true,
                _slug: true,
                subtitle: true,
                publishDate: true,
                author: { name: true, _title: true, avatar: { url: true, alt: true } },
                category: { _title: true },
                coverImage: { url: true, alt: true },
                content: { json: { content: true } },
              },
            },
          },
        },
      ]}
    >
      {async ([{ blog }]) => {
        "use server"

        return (
          <>
            {blog.posts.items.map((post: any) => (
              <div className="bg-white text-gray-900 min-h-screen p-8" key={post._id}>
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-3xl font-bold">Changelog</h1>
                  <p className="text-xs italic text-gray-500">Inspired by Linear</p>
                  <p className="text-gray-600 mt-1">New updates and improvements to Linear.</p>
                  <div className="flex gap-4 mt-2 text-blue-500">
                    <a className="underline" href="#">
                      Subscribe to updates
                    </a>
                    <a className="underline" href="#">
                      Follow us on Twitter
                    </a>
                  </div>
                  <div className="mt-8 flex items-start">
                    <div className="space-y-2">
                      <h2 className="text-md font-semibold whitespace-nowrap">{formatDate(post.publishDate)}</h2>
                    </div>
                    <div className="flex-grow ml-4">
                      <h3 className="text-xl font-semibold">{post._title}</h3>
                      <Image
                        alt={post.coverImage.alt}
                        className="mt-4"
                        height={432}
                        src={post.coverImage.url}
                        style={{ aspectRatio: "768/432", objectFit: "cover" }}
                        width={768}
                      />
                      <div className="mt-4 prose">
                        <RichText>{post.content.json.content}</RichText>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )
      }}
    </Pump>
  )
}

export default ChangeLog;