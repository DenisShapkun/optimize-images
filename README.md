# Оптимизация картинок на десктопе

#### Clone project
`git clone git@github.com:DenisShapkun/optimize-images.git`

#### Enter project
`cd optimize-images`

#### Initialize project
`npm init`

#### Install packages
`npm install`

Put images to `app/images`

#### For resize images (if you need) set sizes you need at `gulpfile.js` and Put images to `app/images/original` and after run

`gulp resize`

After you get resized files at the `app/images/resized`

#### For optimize images run 

`gulp`

or

`gulp default`

After you get optimized images at the `dist/images`

#### For clearing cache run

`gulp clear`