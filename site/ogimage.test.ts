import { expect, test } from "vite-plus/test";
import { ogImageUrl } from "./ogimage.ts";

test("when given the same title, date, and tags as the legacy @cloudinary/url-gen implementation, it produces a byte-identical URL", () => {
  // Arrange
  const title = "title";
  const date = "2006-01-02";
  const tags = "#tag1 #tag2";

  // Act
  const url = ogImageUrl(title, date, tags);

  // Assert: reference URL generated once by the legacy implementation
  expect(url).toBe(
    "https://res.cloudinary.com/dzugrdlkb/image/upload/c_fit,w_840,co_rgb:a5ebec,l_text:Firge35-Bold.ttf_50:title/fl_layer_apply,g_south_west,x_180,y_355/co_rgb:a5ebec7f,l_text:Firge35-Regular.ttf_30:2006-01-02/fl_layer_apply,g_north_west,x_180,y_565/c_fit,w_840,co_rgb:d3d5d57f,l_text:Firge35-Regular.ttf_30:%23tag1%20%23tag2/fl_layer_apply,g_north_west,x_180,y_605/a5ebec-ogimage-left.png",
  );
});
