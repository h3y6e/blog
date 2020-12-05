using Dates

function headline(title, date, tags)
    tag_page = globvar(:tag_page_path)
    io = IOBuffer()
    write(io, """
    <div class="franklin-headline">
    <h1 class="title">$title</h1>
    <div class="date">$date</div>
    <span class="tags">
    """)
    for tag in tags
        write(io, """
        <a href="/$tag_page/$tag">#$tag</a>
        """)
    end
    write(io, "</span></div>")
    return String(take!(io))
end

function bydate!(pagelist)
    sorter(p) = begin
        pvd = pagevar(p, :date)
        if isnothing(pvd)
            return Date(Dates.unix2datetime(stat(p * ".md").ctime))
        end
        return pvd
    end
    sort!(pagelist, by = sorter, rev = true)
end

hfun_year() = year(now())

function hfun_headline()
    title = locvar(:title)
    date = locvar(:date)
    tags = locvar(:tags)
   
    io = IOBuffer()
    write(io, headline(title, date, tags))
    toc = Franklin.hfun_toc(
        string.(locvar.([:mintoclevel, :maxtoclevel]))
    )
    write(io, toc)

    return String(take!(io))
end

function hfun_allposts()
    posts = filter(endswith(".md"), readdir("posts"))
    postpaths = "posts" .* rstrip.(get_url.(posts), '/')
    bydate!(postpaths)

    io = IOBuffer()
    for post in postpaths
        write(io, "<div class=\"postlist\">")
        title = pagevar(post, :title)
        date = pagevar(post, :date)
        tags = pagevar(post, :tags)
        rss = pagevar(post, :rss)
        linktitle = "<a href=\"$post\">$title</a>"
        write(io, headline(linktitle, date, tags))
        write(io, """
        <p>$rss</p>
        <a class="read-more" href="$post">Read more →</a>
        </div>
        """)
    end

    return String(take!(io))
end

function hfun_taglist()
    tag = locvar(:fd_tag)

    rpaths = globvar(:fd_tag_pages)[tag]
    bydate!(rpaths)

    io = IOBuffer()
    for rpath in rpaths
        url = get_url(rpath)
        title = pagevar(rpath, :title)
        date = pagevar(rpath, :date)
        tags = pagevar(rpath, :tags)
        rss = pagevar(rpath, :rss)
        linktitle = "<a href=\"$url\">$title</a>"
        write(io, headline(linktitle, date, tags))
        write(io, "$rss")
    end

    return String(take!(io))
end

hfun_tagpage() = "WIP"

hfun_blogcard(url) = """
    <iframe
    class="hatenablogcard"
    style="width:100%;height:155px;max-width:500px;"
    src="https://hatenablog-parts.com/embed?url=$url"
    width="300"
    height="150"
    allowtransparency='true'
    frameborder="0"
    scrolling="no"
    ></iframe>
"""

hfun_gslides(id) = """
<div class="iframe-wrap">
    <iframe
      src="https://docs.google.com/presentation/d/$id/embed"
      frameboader="0"
      allowfullscreen="true"
      mozallowfullscreen="true"
      webkitallowfullscreen="true"
    >
    </iframe>
</div>
"""