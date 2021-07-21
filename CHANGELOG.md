# Next release

Anticipated release: July 15, 2021

#### 🚀 New features

- manage affiliations and choose state page now make live calls for the list of affiliations ([#3264])

#### 🐛 Bugs fixed

- Upgrade Browser alert not showing up for IE11 ([#3272])
- Reduced the size of the JWT payload because sys admins had a 24KB payload and the max size is 4KB. ([#3246])
- fixed error for users with view-document permission not being able to load an APD([#3264])

#### ⚙️ Behind the scenes
- created test tokens when database is seeded (development and test only) ([#3128]) 

# Previous releases

See our [release history](https://github.com/CMSgov/eAPD/releases)

[#3i28]: https://github.com/CMSgov/eAPD/issues/3128
[#3272]: https://github.com/CMSgov/eAPD/issues/3272
[#3246]: https://github.com/CMSgov/eAPD/issues/3246
[#3164]: https://github.com/CMSgov/eAPD/issues/3264
