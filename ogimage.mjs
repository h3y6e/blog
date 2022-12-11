import { Cloudinary } from "@cloudinary/url-gen";
import { text } from "@cloudinary/url-gen/qualifiers/source";
import { TextStyle } from "@cloudinary/url-gen/qualifiers/textStyle";
import { Position } from "@cloudinary/url-gen/qualifiers/position";
import { compass } from "@cloudinary/url-gen/qualifiers/gravity";
import { source } from "@cloudinary/url-gen/actions/overlay";
import { northWest, southWest } from "@cloudinary/url-gen/qualifiers/compass";
import { TextFitQualifier } from "@cloudinary/url-gen/qualifiers/textFit";

const cld = new Cloudinary({
  cloud: {
    cloudName: "dzugrdlkb",
  },
  url: {
    secure: true,
  },
});

const title = "title";
const date = "2006-01-02";
const tags = "#tag1 #tag2";
const image = cld.image("a5ebec-ogimage-left.png");

image
  .overlay(
    source(
      text(title, new TextStyle("Firge35-Bold.ttf", 50))
        .textFit(new TextFitQualifier(840))
        .textColor("#a5ebec"),
    ).position(
      new Position().gravity(compass(southWest())).offsetX(180).offsetY(355),
    ),
  )
  .overlay(
    source(
      text(date, new TextStyle("Firge35-Regular.ttf", 30)).textColor(
        "#a5ebec7f",
      ),
    ).position(
      new Position().gravity(compass(northWest())).offsetX(180).offsetY(565),
    ),
  )
  .overlay(
    source(
      text(tags, new TextStyle("Firge35-Regular.ttf", 30))
        .textFit(new TextFitQualifier(840))
        .textColor("#d3d5d57f"),
    ).position(
      new Position().gravity(compass(northWest())).offsetX(180).offsetY(605),
    ),
  );

console.log(image.toURL().replace(/#/g, "%23"));
// https://res.cloudinary.com/dzugrdlkb/image/upload/c_fit,w_840,co_rgb:a5ebec,l_text:Firge35-Bold.ttf_50:title/fl_layer_apply,g_south_west,x_180,y_355/co_rgb:a5ebec7f,l_text:Firge35-Regular.ttf_30:2006-01-02/fl_layer_apply,g_north_west,x_180,y_565/c_fit,w_840,co_rgb:d3d5d57f,l_text:Firge35-Regular.ttf_30:%23tag1%20%23tag2/fl_layer_apply,g_north_west,x_180,y_605/a5ebec-ogimage-left.png
