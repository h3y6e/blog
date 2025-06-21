using Dates
using DataStructures
using HTTP
using HTTP.URIs
using Gumbo
using Cascadia
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
    if tags !== nothing
        for tag in tags
            write(
                io,
                """
                <a href="/$tag_page/$tag">#$tag</a>
                """
            )
        end
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
    posts = filter(p -> endswith(p, ".md"), readdir(path))
    return [joinpath(path, replace(post, ".md" => "")) for post in posts]
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

@delay function hfun_allposts()
    rpaths = getpostpaths()
    bydate!(rpaths)
    return postlist(rpaths)
end

@delay function hfun_taglist()
    tag = locvar(:fd_tag)
    rpaths = globvar(:fd_tag_pages)[tag]
    bydate!(rpaths)
    return postlist(rpaths)
end

@delay function hfun_tagpage()
    rpaths = getpostpaths()
    # Filter out nothing values and ensure we have valid tags
    all_tags = [pagevar(rpath, :tags) for rpath in rpaths]
    valid_tags = filter(x -> x !== nothing, all_tags)
    tags = Iterators.flatten(valid_tags)
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
    try
        url = params[1]
        r = HTTP.get(url)
        html = parsehtml(String(r.body))

        image = Cascadia.matchFirst(Selector("meta[property='og:image']"), html.root)
        image = image === nothing ? "" : image.attributes["content"]

        title = Cascadia.matchFirst(Selector("title"), html.root)
        title = title === nothing ? "" : nodeText(title)

        description = Cascadia.matchFirst(Selector("meta[name='description']"), html.root)
        description = description === nothing ? "" : description.attributes["content"]

        domain = URI(url).host

        return """
        <div class="embed" ontouchstart="">
            <img src="$image" decoding="async" loading="lazy">
            <div class="embed-content">
                <b>$title</b>
                <p>$description</p>
                <div class="domain">$domain</div>
            </div>
            <a href="$url" rel="noopener noreferrer nofollow" target="_blank" role="link"></a>
        </div>
        """
    catch
        print("$(params[1]) not found")
        return ""
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

hfun_twitter_intent() = "https://twitter.com/intent/tweet?text=" *
                        HTTP.escapeuri("Reading @h3y6e's " *
                                       locvar(:fd_full_url))

hfun_elk_intent() = "https://elk.zone/intent/post?text=" *
                    HTTP.escapeuri("Reading @h3y6e@social.camph.net's " *
                                   locvar(:fd_full_url))
