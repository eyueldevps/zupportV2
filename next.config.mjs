// Screenshots are uploaded through server actions, whose default limit is only 1 MB.
export default { experimental: { serverActions: { bodySizeLimit: "5mb" } } };
