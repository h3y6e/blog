using Dates
using DataStructures
using HTTP
using JSON

function headline(title, date, tags)
    tag_page = globvar(:tag_page_path)
    io = IOBuffer()
    write(
        io,
        """
        <div class="franklin-headline">
        <h1 class="title">$title</h1>
        """
    )
    date == Date(1) || write(io, "<div class=\"date\">$date</div>")
    write(io, "<span class=\"tags\">")
    for tag in tags
        write(
            io,
            """
            <a href="/$tag_page/$tag">#$tag</a>
            """
        )
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
    sort!(pagelist, by=sorter, rev=true)
end

function postlist(rpaths)
    io = IOBuffer()
    for post in rpaths
        write(io, "<div class=\"postlist\">")
        url = get_url(post)
        title = pagevar(post, :title)
        date = pagevar(post, :date)
        tags = pagevar(post, :tags)
        rss = pagevar(post, :rss_description)
        linktitle = "<a href=\"$url\">$title</a>"
        write(io, headline(linktitle, date, tags))
        write(
            io,
            """
            <p>$rss</p>
            <a class="read-more" href="$url">Read more →</a>
            </div>
            """
        )
    end
    return String(take!(io))
end

function getpostpaths(path="posts")
    posts = readdir(path)
    return path .* rstrip.(get_url.(posts), '/')
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
    rpaths = getpostpaths()
    bydate!(rpaths)
    return postlist(rpaths)
end

function hfun_taglist()
    tag = locvar(:fd_tag)
    rpaths = globvar(:fd_tag_pages)[tag]
    bydate!(rpaths)
    return postlist(rpaths)
end

function hfun_tagpage()
    rpaths = getpostpaths()
    tags = Iterators.flatten(pagevar.(rpaths, :tags))
    namesortedtags = collect(SortedDict(counter(tags)))
    countsortedtags = sort(namesortedtags; by=x -> x[2], rev=true)
    count = countsortedtags[1][2]
    io = IOBuffer()
    write(
        io,
        """
        <table class="tagpage">
        <tr><th>count</th><th>name</th></tr>
        <tr><td class="count">$count</td>
        <td class="block">
        """
    )
    for (tag, c) in countsortedtags
        if c < count
            write(
                io,
                """
                </td></tr>
                <tr><td class="count">$c</td>
                <td class="block">
                """
            )
            count = c
        end
        write(
            io,
            """
            <a href="$tag/">#$tag</a>
            """
        )
    end
    write(io, "</td></tr></table>")
    return String(take!(io))
end

function hfun_embed(params)
    r = HTTP.get("https://jsonlink.io/api/extract?url=$(params[1])")
    body = JSON.parse(String(r.body))
    try
        title = length(params) == 2 ? params[2] : body["title"]
        return """
        <div class="embed" ontouchstart="">
            <img src="$(body["images"][1])" alt="$(body["description"])" decoding="async" loading="lazy">
            <div class="embed-content">
                <b>$title</b>
                <p>$(body["description"])</p>
                <div class="domain">$(body["domain"])</div>
            </div>
            <a href="$(body["url"])" rel="noopener noreferrer nofollow" target="_blank" role="link"></a>
        </div>
        """
    catch
        throw("keys not found for $(params[1])")
    end
end

function hfun_ogimage_url()
    title = HTTP.escapeuri(locvar(:title))
    date = locvar(:date)
    tags = "%23" * join(locvar(:tags), "%20%23")
    return "https://res.cloudinary.com/dzugrdlkb/image/upload/" *
           "c_fit,w_840,co_rgb:a5ebec,l_text:Firge35-Bold.ttf_50:$title/" *
           "fl_layer_apply,g_south_west,x_180,y_355/" *
           "co_rgb:a5ebec7f,l_text:Firge35-Regular.ttf_30:$date/" *
           "fl_layer_apply,g_north_west,x_180,y_565/" *
           "c_fit,w_840,co_rgb:d3d5d57f,l_text:Firge35-Regular.ttf_30:$tags/" *
           "fl_layer_apply,g_north_west,x_180,y_605/a5ebec-ogimage-left.png"
end
