ARG BASE_IMAGE_PATH
FROM $BASE_IMAGE_PATH
RUN npx parcel build src/targets/user/main.ts -d out --no-minify --target=node
HEALTHCHECK CMD curl --fail --max-time 1 http://localhost:8000/ || exit 1
CMD ["node", "out/main.js"]
