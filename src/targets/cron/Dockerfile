ARG BASE_IMAGE_PATH
FROM $BASE_IMAGE_PATH
RUN npx parcel build src/targets/cron/jobs/*.ts -d out --no-minify --target=node --no-cache
