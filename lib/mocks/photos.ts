import type { Photo } from "@/lib/types";

export type PhotoKey =
  | "ala-archa"
  | "altyn-arashan"
  | "arslanbob"
  | "bazaar-bread"
  | "bazaar-spices"
  | "beach-umbrellas"
  | "bishkek-square"
  | "burana"
  | "cafe-coffee"
  | "food-beshbarmak"
  | "food-fish"
  | "food-kulchotai"
  | "food-lagman"
  | "food-langet"
  | "food-plov"
  | "food-salad"
  | "hero-song-kol"
  | "horse-golden"
  | "horse-valley"
  | "issyk-kul-beach"
  | "issyk-kul-poplars"
  | "jeti-oguz"
  | "kol-suu"
  | "osh"
  | "sary-chelek"
  | "skazka"
  | "ski-pines"
  | "ski-slope"
  | "ski-valley"
  | "stay-garden"
  | "stay-garden-2"
  | "stay-guesthouse"
  | "stay-homestay"
  | "stay-hostel"
  | "stay-hotel"
  | "stay-hotel-2"
  | "stay-hotel-3"
  | "stay-resort"
  | "tash-rabat"
  | "yurt-altyn-arashan"
  | "yurt-horses"
  | "yurt-interior"
  | "yurt-song-kol";

const FILES: Record<PhotoKey, { url: string; blur: string }> = {
  "ala-archa": {
    url: "/photos/ala-archa.jpg",
    blur: "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAAAQAgCdASoQAAwABABoJQBOgCIj8irjw8QAAM4/LcyOcztzAFEHibNSoAmFNrve9gjXFSPd8BsKTVLlyFJ06rLhY6Ghi4uvWrMzDJb8Xj80WpgA",
  },
  "altyn-arashan": {
    url: "/photos/altyn-arashan.jpg",
    blur: "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADwAQCdASoQAAsABABoJYgCdAELUWl9bgAA/ngi4Itii40YuIlGhxbeakvbi9I6ncz44x+C3+ve2TYNyg7nNAUwAAA=",
  },
  "arslanbob": {
    url: "/photos/arslanbob.jpg",
    blur: "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAAAQAgCdASoQAAsABABoJZACdAEPEJ7+ULAAAPffAVl/h5gKiPkYdBk1y1wU3ZORquhzJggAAAA=",
  },
  "burana": {
    url: "/photos/burana.jpg",
    blur: "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAAAQAgCdASoQAAoABABoJYgCdGuAAs0nlOUAAP7v0i9ltqKOa9+Tx9NSZ1Bls2Vk0iUMBpBuFAv23RAoGAAAAA==",
  },
  "hero-song-kol": {
    url: "/photos/hero-song-kol.jpg",
    blur: "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAABQAgCdASoQAAsABABoJZACdGuAAvldrBoj2AAA3J0q5v986DVBhjnA/5G0sC30QkrCZzSpba7Z1W7AAAA=",
  },
  "horse-golden": {
    url: "/photos/horse-golden.jpg",
    blur: "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAAAQAgCdASoQAAkABABoJbACdAEPS7vz5CGkAPzZMLRbii6SNSLr08XCfpIy+bqxV/fTPEMp8/lAAA==",
  },
  "horse-valley": {
    url: "/photos/horse-valley.jpg",
    blur: "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAAAQAgCdASoQAAsABABoJagCdADxEk6ldTMAAP6x90+nGIdS/rkhTf3+gXoB0YHnTsQl90KAenfExmMjCQecluleVMAMg68mgAA=",
  },
  "issyk-kul-beach": {
    url: "/photos/issyk-kul-beach.jpg",
    blur: "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADwAQCdASoQAAoABABoJbACdAEUnZt3YAAA/I8IbYrb/VVwvjZmZxggtNfPvtw9JWkPH1rpJaRnNP3EnrcGtI1u8f0c8VVGyGFRQegAAAA=",
  },
  "issyk-kul-poplars": {
    url: "/photos/issyk-kul-poplars.jpg",
    blur: "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAABQAgCdASoQAAoABABoJbACdEf/gZZjTAgrxgAA/t7sfuZ83+5yuFdpSwiNhfwuGZmKKHruV69ft6KPJZxnw+ZaB90AHN6rZ+qfs9w8ujPMIAAA",
  },
  "jeti-oguz": {
    url: "/photos/jeti-oguz.jpg",
    blur: "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADwAQCdASoQAAkABABoJQBOgCB/SkCGWMAA/u1xlHqQxiv/OXTcVytN7wyQX5UETc7YTxwYAeeuIuZDgAA=",
  },
  "kol-suu": {
    url: "/photos/kol-suu.jpg",
    blur: "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADwAQCdASoQAAwABABoJaAAAc0RP4CKigAA/b7xHZ6/cPRFXf0YZv+REbMZqBwfPwejH4mAOuakbRx6rsr7wL/iT8n3X/VP2AA=",
  },
  "osh": {
    url: "/photos/osh.jpg",
    blur: "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAACQAQCdASoQAAsABABoJaACdADrrJAA/rGOMnMFqMK+6PKzDucde7Mp2ci9+Q/FbgpuEbTQ6e+26/Md+4t7CAAA",
  },
  "sary-chelek": {
    url: "/photos/sary-chelek.jpg",
    blur: "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAAAQAgCdASoQAAsABABoJZACdAEUpKS1isgAAP7n/0ANZr1orjnX15WHEcTFpJfi3TjTASHwF6C1i+BcnqwrXEinXHvWbBZ8oqfhFAAA",
  },
  "skazka": {
    url: "/photos/skazka.jpg",
    blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAAAQAgCdASoQAAoABABoJZACdAEQzZL2NCqQAP6GBYKMPpUDeZpgt4Y5XNK3OzbpSC89QPfh3cI3C0E3MZn9hChkcY5v15O5VTwaalOj45HQAA==",
  },
  "ski-pines": {
    url: "/photos/ski-pines.jpg",
    blur: "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAAAwAgCdASoQAAcABABoJZwAD4oun3H26K15wAD+TTdvmsf2eHIiJebkewHFvFpfaYlaLhLjFaPfxOLFb4hxdV0TFaET3LPYCAAAAA==",
  },
  "ski-slope": {
    url: "/photos/ski-slope.jpg",
    blur: "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADwAQCdASoQAAkABABoJZQCw7EUh/uzqJgA/ma2n6cBVyoOMc+ZauXL5R9FPcbRfrGM3Suk9YJ2APzmXSjUvgAA",
  },
  "ski-valley": {
    url: "/photos/ski-valley.jpg",
    blur: "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAQAgCdASoQAAcABABoJYgCdAD2Px372XtQAP7m6I33nku1wVxB1ib04n5uTbYMpkpFFb0lZXxywReqRiQAem1XwAA=",
  },
  "tash-rabat": {
    url: "/photos/tash-rabat.jpg",
    blur: "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAAAwAgCdASoQAAsABABoJZgCdAEUrl5CH6IoAAD+x4GjyrjXS6OhMRQDVUb9dBQ16UToyDBldnEZPo76a1YiMk7RZ3mJ/Br1KuAAAA==",
  },
  "yurt-altyn-arashan": {
    url: "/photos/yurt-altyn-arashan.jpg",
    blur: "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAQCdASoQAAsABABoJYgCdAC9vdHFjQAA9roMLj5Gny3J6sk9lbK2MaQZ2XVkHUWFaROlK3yhjZlCRktiUCRPJh8nSz9M6OUfWDUsYIATkFMgAAA=",
  },
  "yurt-horses": {
    url: "/photos/yurt-horses.jpg",
    blur: "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAADwAQCdASoQAAsABABoJYgCdADJ0NPdIAAA94wIKDxb63vhJ9QGUZmmIFK3+zFA2Xqcg2gAAAA=",
  },
  "yurt-song-kol": {
    url: "/photos/yurt-song-kol.jpg",
    blur: "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADwAQCdASoQAAsABABoJagCdAEO43K2Q/gA/mTV/AILiP8KXBQa+ujoy7pcgKVM+kQGaBogA3i1mwy9ZmAAAA==",
  },
  "bazaar-bread": {
    url: "/photos/bazaar-bread.jpg",
    blur: "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAADwAQCdASoQAAsAA4BaJZgCdAEOIpYmRwAA/t2524MvLsdcWm16THV9porak7iVPh3zSPRUpalq5ePPRtkhowii11mNDUTlDxdQxG/8SOROZBDz6tCe2vU5u0ngPSuVHLQenAAA",
  },
  "bazaar-spices": {
    url: "/photos/bazaar-spices.jpg",
    blur: "data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAAAQAgCdASoQAAsAA4BaJbACdAYwdvjmN4YwAP4GBDOCmMeRHptiqxJQlQd11/76j+ildOeGGo9S3aAoWNY7z8pOLde3lShLH+mekZ9LMAztXvBttPSp9ZP4kXJfzQvz9m0d11ckj2dRwoj62wtgAA==",
  },
  "beach-umbrellas": {
    url: "/photos/beach-umbrellas.jpg",
    blur: "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADwAQCdASoQAAwAA4BaJYgCdGuAArXKmpYA/lmKj9d4hsgWEbBy3qY5vDRkKnGiHBPy9WGkzXOKvN/1wr3/kmAA",
  },
  "food-beshbarmak": {
    url: "/photos/food-beshbarmak.jpg",
    blur: "data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAAAwAgCdASoQAAsAA4BaJbACdAYvrKv1V+0XbADficFzb9ylG5cU9cpmoHj/t+wjYL7ziUJeWLbg1dl3CiKkuT/9cmc9zzfJw02KJWM5N+yVzkRcAx0+BxbFakfQsTrUz/w2qmh8mZPdgAAA",
  },
  "food-fish": {
    url: "/photos/food-fish.jpg",
    blur: "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAAAwAgCdASoQAAwAA4BaJbACdAD7g2Z/KdeTwAD9x1cutE7tCpO6+DmuDKr58as/rhclycWWGdq+KXgDLtjF/Gq+mECbpJ7QO71+T+eaVcx7D/kgMLG93FLyBw5y33tryfkzed+iMweWulcekEO6e1qxAAA=",
  },
  "food-kulchotai": {
    url: "/photos/food-kulchotai.jpg",
    blur: "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAwAgCdASoQAAsAA4BaJYwCdAYstjvKD4HegAD+qgtTTjAPg2RyHvEFCseWCePuXpTv402Q7238MB53UxsPtilsHOXcv9uuQhB7iau63d56uR0oA5WClYjZ8e8bxRRs18WoAAAA",
  },
  "food-lagman": {
    url: "/photos/food-lagman.jpg",
    blur: "data:image/webp;base64,UklGRngAAABXRUJQVlA4IGwAAAAwAgCdASoQAAsAA4BaJbACdAYubgE6LZngAAD+6ydWnQ2dA1JgYp+plQU5ZqPL9I/dsteUfW01NczJtS385CuGw43MHDy/9B2grGq5kTD+jOf3Re8L/POIddrns8mITJ8Zxw1wFDO/+D2AAAA=",
  },
  "food-langet": {
    url: "/photos/food-langet.jpg",
    blur: "data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAACQAgCdASoQAAwAA4BaJbACdAYvhny9mUQheVoAAAD+0c06nqR5SIw+cCjZrSW+0bxcvCh4ePYAFSJzBquwrjjjHiPw+l+UNhftn5FhwDOs9/W5bYBNG2xbqmLdoe0kXdwCkpGT8/Qc3mMUnTlqbNivJhT2QXQAAAA=",
  },
  "food-plov": {
    url: "/photos/food-plov.jpg",
    blur: "data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAAAwAgCdASoQAAwAA4BaJbACdAYuRwUBNozpIAD+CMHAlQiTVwH2oY89Brtx75WMtJrct9u2nPbEg5A2uyq/xVpz9RyY8PiFd3DORA6md+Gq8ax8WsLNDIGBX2e29mSXGaaGFvj49YED9N+Vg/fAAA==",
  },
  "food-salad": {
    url: "/photos/food-salad.jpg",
    blur: "data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAABwAgCdASoQAAwAA4BaJagCdAYwnTUlmMFU0siAAP7tHu6gzBfJSl1ocdqEyzu//hyWWb0EHhEHk6VzkAM2MrotKCPwvqJ+gWY/C20ggkDbkokilShBnXHJUy7euEoXIDKaMtBv7RiexmzSNQAAAA==",
  },
  "stay-garden": {
    url: "/photos/stay-garden.jpg",
    blur: "data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAABwAgCdASoQAAsAA4BaJZgCdH8AGZMRxTzAUhJAAP7a07HPHcwQ4xCDFcxLqM42TdatL4ZxCDaQu4/Hvzl1OdSDbGihfKpWUp6ZGrHl/8U09nrmukWwJ/k28D45ms6rSTLA8wPAAAA=",
  },
  "stay-garden-2": {
    url: "/photos/stay-garden-2.jpg",
    blur: "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAADwAQCdASoQAAsAA4BaJbACdAEDHZm4YcAA/rI9ScroGNWMJg6Xqvx8vWLI/Z04ufXVSRou3IR3vcZIbes5uXMW7mjsUL9DfOOzUMrkzglsMRjxBjlvgAAA",
  },
  "stay-guesthouse": {
    url: "/photos/stay-guesthouse.jpg",
    blur: "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAQAgCdASoQAAsAA4BaJagCdAEQ96pKvip8AOGc9vMg5INdI0OqlOeLZfLqpucUyHHZHAUVWrmPWQR2DwMQugXcRTt9FuQa2khKWjkBamnQyszRZL9iAAAA",
  },
  "stay-homestay": {
    url: "/photos/stay-homestay.jpg",
    blur: "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADwAQCdASoQAAwAA4BaJbACdADLr09mdAAA/spWt3YhAvjB0CeO+8NsTjImajQEiXjat1Zvbs8lJKPcZtGY6fn+2HQr34jjCtmg6b2ab+ikdAAA",
  },
  "stay-hotel-2": {
    url: "/photos/stay-hotel-2.jpg",
    blur: "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAAAQAgCdASoQAAkAA4BaJbACdAEQWcHW/GoAAP5OXEnL7XeLtKG8ddNSmVu54xFVtZNqHW5KHryDKuEC1aJjoJ/m0uVGH4wmkw57HBhG3nCOAAAA",
  },
  "stay-hotel-3": {
    url: "/photos/stay-hotel-3.jpg",
    blur: "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAAAwAgCdASoQAAwAA4BaJYgCdAEDEt73D/i4gAD4RVNRhEkc+L0EXvMlB6NGr25CfPC9iI4T5I++J9uVLkbqVLH83PaE5Z4nKigaC3+UVmS/E3jjbvZAAA==",
  },
  "bishkek-square": {
    url: "/photos/bishkek-square.jpg",
    blur: "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAAAwAgCdASoQAAwAA4BaJYgCdAEO9JJDuxk8AAD+WQk0XjwY571JPckHxCzsP6uXTdcoe6dB6TSTx3pDPPLbS4kkVSTsUemfp+a5WBxgAAA=",
  },
  "cafe-coffee": {
    url: "/photos/cafe-coffee.jpg",
    blur: "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADQAQCdASoQAAsAA4BaJagCdADY6g1v2AD+NEtO1SvHdXnyBLXq/lCoAcj9dw4ntp3WLkpjkEnO9OByn3g1vySzKxsF7bEebPA4f/WOoQAAAA==",
  },
  "stay-hostel": {
    url: "/photos/stay-hostel.jpg",
    blur: "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAAAQAgCdASoQAAkAA4BaJYwCdAEfB/DMuKdcAP5Ioj4cia2aQwPHYrWqiQdn9woIYw/y8HmN5QbA4Php3p9UxGXBtL6gWx9oZB00NAAA",
  },
  "stay-hotel": {
    url: "/photos/stay-hotel.jpg",
    blur: "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAAAQAgCdASoQAAwAA4BaJbACdAD0sZ0s5AeAAP7uoTkYJxPvxJ4uaQROe7v/OnsZdcfsRMwi9jfDHPVwt5Zzf55S7JWiummAAAA=",
  },
  "stay-resort": {
    url: "/photos/stay-resort.jpg",
    blur: "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAADwAQCdASoQAAoAA4BaJZgCdAEOwTQTQAAA/vHK+od7zhfrW0b7NNTq9c1VROPDn0SBlFWd2AA=",
  },
  "yurt-interior": {
    url: "/photos/yurt-interior.jpg",
    blur: "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAADQAQCdASoQAAwAA4BaJQBOgBhlZvcI5AD+3PXZhr/lQydddTr/CNbHaxv4FTrlfYq3hL4/nPG22FO5fx3o7BDx+VjPvNHq4C4TDJ/UUTsl8795MVgAAA==",
  },
};

export function photo(key: PhotoKey, alt: string): Photo {
  return { url: FILES[key].url, alt, blur_data_url: FILES[key].blur };
}
