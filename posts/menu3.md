@def title = "working with tags"
@def rss = "A short description of the page which would serve as **blurb** in a `RSS` feed; you can use basic markdown here but the whole description string must be a single line (not a multiline string). Like this one for instance. Keep in mind that styling is minimal in RSS so for instance don't expect maths or fancy styling to work; images should be ok though: ![](https://upload.wikimedia.org/wikipedia/en/b/b0/Rick_and_Morty_characters.jpg)"
@def date = Date(2020, 3, 21)
@def tags = ["syntax", "code", "image"]


## Indicating tags

To mark a page with tags, add:

```markdown
@def tags = ["tag1", "tag2"]
```

then that page, along with all others that have the tag `tag1` will be listed at `/tag/tag1/`.

## Customising tag pages

You can change how a `/tag/...` page looks like by modifying the `_layout/tag.html`. An important note is that you can **only** use **global** page variables (defined in `config.md`).

There are three "exceptions":

1. you can still use `{{ispage /tag/tagname/}} ... {{end}}` (or `{{isnotpage ...}}`) to have a different layout depending on the tag,
1. you can use the `fd_tag` variable which contains the  name of the tag so `{{fill fd_tag}}` will input the tag string as is,
1. you can use `{{fill varname path/to/page}}` to exploit a page variable defined in a specific page.

## Customising tag lists

By default the tag list is very simple: it just collects all pages that match the tags and it shows them in a simple list by anti-chronological order (more recent at the top).

You can customise this by defining your own `hfun_custom_taglist` function in the `utils.jl` file. The commented blueprint for the simple default setting is below and should give you an idea of how to  write your own generator.

Assuming you've defined such a function, don't forget to use `{{custom_taglist}}` in the `_layout/tag.html` instead of the default `{{taglist}}`.

```julia
function hfun_custom_taglist()::String
    # -----------------------------------------
    # Part1: Retrieve all pages associated with
    #  the tag & sort them
    # -----------------------------------------
    # retrieve the tag string
    tag = locvar(:fd_tag)
    # recover the relative paths to all pages that have that
    # tag, these are paths like /blog/page1
    rpaths = globvar("fd_tag_pages")[tag]
    # you might want to sort these pages by chronological order
    # you could also only show the most recent 5 etc...
    sorter(p) = begin
        # retrieve the "date" field of the page if defined, otherwise
        # use the date of creation of the file
        pvd = pagevar(p, :date)
        if isnothing(pvd)
            return Date(Dates.unix2datetime(stat(p * ".md").ctime))
        end
        return pvd
    end
    sort!(rpaths, by=sorter, rev=true)

    # --------------------------------
    # Part2: Write the HTML to plug in
    # --------------------------------
    # instantiate a buffer in which we will write the HTML
    # to plug in the tag page
    c = IOBuffer()
    write(c, "...1...")
    # go over all paths
    for rpath in rpaths
        # recover the url corresponding to the rpath
        url = get_url(rpath)
        # recover the title of the page if there is one defined,
        # if there isn't, fallback on the path to the page
        title = pagevar(rpath, "title")
        if isnothing(title)
            title = "/$rpath/"
        end
        # write some appropriate HTML
        write(c, "...2...")
    end
    # finish the HTML
    write(c, "...3...")
    # return the HTML string
    return String(take!(c))
end
```

For instance the default uses:

```html
<!-- 1, 3: simple list-->
<ul>...</ul>
<!-- 2: simple list item plugging in path + title -->
<li><a href="/$rpath/">$title</a></li>
```
