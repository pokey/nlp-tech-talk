NLP tech talk
=============

Tech talk on NLP to be given at Globality.

Viewing the presentation
------------------------

1. Run the [babilonia client](https://github.com/globality-corp/babilonia#updating-the-frontend-ui).
1. Run tensorboard word embedding visualization
   1. Install tensorboard
   1. `tar xzf tensorboard-logdir.tar.gz`
   1. `tensorboard --logdir tensorboard-logdir`
1. Open [index.html](index.html).

Examples for relation extraction
--------------------------------

In [Google doc](https://docs.google.com/document/d/1KjQ1VMPm-xQQYOI9XMGxdhjft6syPpvwkolaBFOIK3I/edit?usp=sharing),
but copied here:
- We are located in Spain.
- We are looking to expand our operations to San Francisco.
- We're a small firm headquartered in Canada looking for clients in Germany.
- Our fully bilingual and bicultural team provides results-driven strategies
  and creative solutions through offices in San Francisco and Tokyo.

Converting to PDF
-----------------

1. Take screenshot of each slide and put all screenshots into a folder, say `images`.
2. Use ImageMagick to convert them to a PDF, eg:

   ```
   convert images/*.png nlp-tech-talk.pdf
   ```

Credit
------
Based on [WebSlides](https://webslides.tv/), which is licensed under the MIT
license.
