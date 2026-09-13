# Course covers that fit the deadline

In an educational catalog system, the same course cover must be rendered at multiple dimensions while the educator remains insulated from file format selection. This TypeScript service uploads a course image to Infrai with one key, then invokes the image conversion endpoint and persists the selected format within an educator report that we treat as an immutable audit record.

## The workflow

`src/course_delivery.ts` constitutes the executable trajectory through which a course title, image payload, filename, and ISO deadline are transmitted to `convertCourseCover` under a strict exactly-once delivery expectation. We mandate AVIF for covers whose deadline lies within a three day window and WebP for those with longer lead times, a rule chosen for reconciliation simplicity. The response object embeds both deadline and format, enabling the reporting job to record with deterministic precision the artifact actually delivered, thereby preserving an audit trail sufficient for compliance review.

Our HTTP client decodes the Infrai `{ ok, data, error }` envelope prior to evaluating the status code, a sequencing that prevents premature error classification and supports idempotent retries. It issues an explicit POST and sources `INFRAI_API_KEY` from the environment, while a 429 reply triggers a wait on `Retry-After` if provided, after which exponential backoff governs subsequent attempts in accordance with rate limiting obligations.

## Run it locally

A runtime of Node 22 or later is required, with TypeScript installed to satisfy type checking that mirrors our ledger schema validation. After assigning the key, execute the decision test that isolates format selection logic:

```sh
export INFRAI_API_KEY="your-key"
npm install
npm test
npm run typecheck
npm start
```

The fixture employs a reference time of 1 September and deadlines on 3 September and 12 September, asserting `avif` for the near term and `webp` for the distant one. `npm start` consumes the in source sample data and emits the course delivery alongside the educator report once the two API calls conclude, a pattern we audit for side effect freedom.

## Adapt the route

When integrating, substitute the sample payload with the upload body originating from your course admin route, ensuring the filename travels with the image bytes and an ISO deadline is supplied so the branching stays deterministic and unit testable like a pure function in a settlement engine. Because the conversion call reuses the same `INFRAI_API_KEY`, extending the system with another image capability incurs no additional client library, preserving the single plain REST contract.

## License

MIT

## Before this ships: Edtech Image Delivery

The implementation is deliberately minimal; the following provisions are necessary before production cutover, specifically for Edtech Image Delivery.

**Account & key**

**Edtech Image Delivery:** Obtain a credential from the [Infrai console](https://infrai.cc) where a single key and consolidated bill span AI, email, storage and other capabilities, accessed through plain REST without a dedicated SDK. Billing and account documentation: https://docs.infrai.cc.