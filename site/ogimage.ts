// Builds the Cloudinary OG image URL: title, date, and tags rendered in Firge35
// over a5ebec-ogimage-left.png. Usage: node ogimage.ts <title> <date> <tags>

const encode = (text: string): string =>
  encodeURI(text.replaceAll(",", "%2C").replaceAll("/", "%2F")).replaceAll("#", "%23");

export const ogImageUrl = (title: string, date: string, tags: string): string =>
  "https://res.cloudinary.com/dzugrdlkb/image/upload/" +
  `c_fit,w_840,co_rgb:a5ebec,l_text:Firge35-Bold.ttf_50:${encode(title)}/` +
  "fl_layer_apply,g_south_west,x_180,y_355/" +
  `co_rgb:a5ebec7f,l_text:Firge35-Regular.ttf_30:${encode(date)}/` +
  "fl_layer_apply,g_north_west,x_180,y_565/" +
  `c_fit,w_840,co_rgb:d3d5d57f,l_text:Firge35-Regular.ttf_30:${encode(tags)}/` +
  "fl_layer_apply,g_north_west,x_180,y_605/" +
  "a5ebec-ogimage-left.png";

if (import.meta.main) {
  const [title = "title", date = "2006-01-02", tags = "#tag1 #tag2"] = process.argv.slice(2);
  console.log(ogImageUrl(title, date, tags));
}
