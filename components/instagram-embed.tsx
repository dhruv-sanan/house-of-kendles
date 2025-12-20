"use client"

// A simple, responsive Instagram embed component
export function InstagramEmbed({ postUrl, title }: { postUrl: string, title: string }) {
  // Ensure the URL ends with /embed
  const embedUrl = postUrl.endsWith('/embed') ? postUrl : `${postUrl}embed`

  return (
    <div className="w-full max-w-sm mx-auto rounded-lg shadow-lg overflow-hidden border">
      <iframe
        className="w-full"
        height="540" // Instagram embeds have a fixed height
        src={embedUrl}
        title={title}
        allowFullScreen
        scrolling="no"
        frameBorder="0"
      />
    </div>
  )
}