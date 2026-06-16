import fetch from 'node-fetch';

const BLOG_AGENT_BASE_URL = 'https://novox-blogs.onrender.com';

const proxyRequest = async (req, res, targetPath) => {
  try {
    const url = new URL(targetPath, BLOG_AGENT_BASE_URL);
    
    // Forward all query parameters
    Object.keys(req.query).forEach(key => url.searchParams.append(key, req.query[key]));

    const headers = {
      'Content-Type': 'application/json',
      ...(req.headers['x-site-id'] && { 'x-site-id': req.headers['x-site-id'] }),
      // Also check query for siteId as some endpoints accept it
      ...(req.query.siteId && { 'x-site-id': req.query.siteId }) 
    };

    const options = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);

    // Special handling for the image stream
    if (targetPath.startsWith('/api/blogs-image')) {
      const contentType = response.headers.get('content-type');
      if (contentType) res.setHeader('Content-Type', contentType);
      const buffer = await response.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }

    const data = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(data);
      
      // Deduplicate blogs by filename if returning an array
      if (Array.isArray(jsonData)) {
        const unique = [];
        const seen = new Set();
        for (const item of jsonData) {
          if (item && item.filename) {
            if (!seen.has(item.filename)) {
              seen.add(item.filename);
              unique.push(item);
            }
          } else {
            unique.push(item);
          }
        }
        jsonData = unique;
      } else if (jsonData && Array.isArray(jsonData.data)) {
        // Just in case it's wrapped in { data: [...] }
        const unique = [];
        const seen = new Set();
        for (const item of jsonData.data) {
          if (item && item.filename) {
            if (!seen.has(item.filename)) {
              seen.add(item.filename);
              unique.push(item);
            }
          } else {
            unique.push(item);
          }
        }
        jsonData.data = unique;
      }
    } catch(e) {
      return res.status(response.status).send(data);
    }

    // Since our dashboard frontend expects data to be wrapped in `{ success, data }` or just returns the json
    // we'll just forward the JSON exactly as the blog agent sends it, because the frontend code we wrote relies on it.
    // Wait, in BlogDashboardContent.jsx we used: resData.data?.blogs || resData.data || []
    // So the frontend handles various structures. We just return exactly what the agent returns.
    return res.status(response.status).json(jsonData);

  } catch (error) {
    console.error(`Error proxying to blog agent at ${targetPath}:`, error);
    return res.status(500).json({ success: false, message: 'Failed to communicate with Blog Agent service' });
  }
};

export const getConfig = async (req, res) => proxyRequest(req, res, '/api/config');
export const generateDraft = async (req, res) => proxyRequest(req, res, '/api/generate');
export const generateImageOnly = async (req, res) => proxyRequest(req, res, '/api/generate-image-only');
export const publishPost = async (req, res) => proxyRequest(req, res, '/api/publish');
export const deletePost = async (req, res) => proxyRequest(req, res, `/api/blogs/${req.params.filename}/delete`);
export const streamImage = async (req, res) => proxyRequest(req, res, '/api/blogs-image');
export const listBlogs = async (req, res) => proxyRequest(req, res, '/api/blogs');
export const getBlogDetails = async (req, res) => proxyRequest(req, res, `/api/blogs/${req.params.filename}`);
export const verifyPasscode = async (req, res) => proxyRequest(req, res, '/api/verify-passcode');
