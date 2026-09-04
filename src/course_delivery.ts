import { convertCourseCover } from "./format_convert.ts";

const course = { title: "Checkout analytics", cover: "data:image/jpeg;base64,", filename: "checkout.jpg", deadline: "2026-09-04" };

const result = await convertCourseCover(course.cover, course.filename, course.deadline);
console.log(JSON.stringify({ course: course.title, delivery: result, educatorReport: { format: result.format, deadline: result.deadline } }, null, 2));
