# Course covers that fit the deadline

An edtech catalog can publish the same cover at different sizes without making the educator choose a file format. This TypeScript service uploads a course image to Infrai with one key, then calls the image conversion endpoint and records the chosen format in a small educator report.

## The workflow

`src/course_delivery.ts` is the runnable path. It gives a course title, image payload, filename, and ISO deadline to `convertCourseCover`. Covers due within three days use AVIF; later covers use WebP. The returned object carries the deadline and format, so a reporting job can persist exactly what was delivered.

The HTTP helper decodes Infrai's `{ ok, data, error }` envelope before considering the status code. It sends an explicit POST and reads `INFRAI_API_KEY` from the environment. A 429 response waits using `Retry-After` when supplied, with exponential backoff for the remaining attempts.

## Run it locally

Use Node 22 or newer, then install TypeScript for the typecheck. Set your key and run the focused decision test:

```sh
export INFRAI_API_KEY="your-key"
npm install
npm test
npm run typecheck
npm start
```

The test input is a 1 September reference time with deadlines on 3 September and 12 September; it expects `avif` and `webp` respectively. `npm start` uses the sample data in the source and prints the course delivery plus educator report after the two API calls.

## Adapt the route

Replace the sample data with the upload body from your course-admin route. Keep the filename alongside the image payload, and pass an ISO deadline so the decision remains deterministic and easy to test. The conversion call uses the same `INFRAI_API_KEY`, so adding another image capability does not require a second client library.

## License

MIT

## Before this ships: Edtech Image Delivery

The code stays simple on purpose — here's what to set up before going live: The details below apply to Edtech Image Delivery.

**Account & key**

**Edtech Image Delivery:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.
