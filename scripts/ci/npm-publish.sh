
# echo "GITHUB_REF_NAME: " $GITHUB_REF_NAME # branch or tag name
# echo "GITHUB_REF_TYPE: " $GITHUB_REF_TYPE # branch or tag

# # Install dependencies
# npm install

# Build the package
npm run build

# Set the npm version based on the GitHub ref name (tag)
npm version $GITHUB_REF_NAME --no-git-tag-version

# Publish the package to npm
npm publish --access public --tag latest