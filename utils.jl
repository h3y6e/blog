using Dates
using DataStructures

function headline(title, date, tags)
    tag_page = globvar(:tag_page_path)
    io = IOBuffer()
    write(io, """
    <div class="franklin-headline">
    <h1 class="title">$title</h1>
    """)
    date == Date(1) || write(io, "<div class=\"date\">$date</div>")
    write(io, "<span class=\"tags\">")
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

function postlist(rpaths)
    io = IOBuffer()
    for post in rpaths
        write(io, "<div class=\"postlist\">")
        url = get_url(post)
        title = pagevar(post, :title)
        date = pagevar(post, :date)
        tags = pagevar(post, :tags)
        rss = pagevar(post, :rss)
        linktitle = "<a href=\"$url\">$title</a>"
        write(io, headline(linktitle, date, tags))
        write(io, """
        <p>$rss</p>
        <a class="read-more" href="$url">Read more →</a>
        </div>
        """)
    end
    return String(take!(io))
end

function getpostpaths(path = "posts")
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
    countsortedtags = sort(namesortedtags; by = x -> x[2], rev = true)
    count = countsortedtags[1][2]
    io = IOBuffer()
    write(io, """
    <table class="tagpage">
    <tr><th>count</th><th>name</th></tr>
    <tr>
    <td class="count">$count</td>
    <td class="block">
    """)
    for (tag, c) in countsortedtags
        write(io, """
            <a href="$tag/">#$tag</a>
        """)
        if c < count
            write(io, """
            </td></tr>
            <tr>
            <td class="count">$c</td>
            <td class="block">
            """)
            count = c
        end
    end
    write(io, "</tr></table>")
    return String(take!(io))
end