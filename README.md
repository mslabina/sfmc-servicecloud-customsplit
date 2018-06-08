# Salesforce Marketing Cloud - Service Cloud Custom Split Activity

## Introduction

This is a basic example of a custom journey builder split activity that reads data from Salesforce Service Cloud and is ready to be deployed to heroku. As of April 2017 this is necessary as a workaround as decision split evaluation for changes in Service Cloud don't evaluate correctly if there are multiple instances of the queried object for one single contact (contact and object have a one-to-many relationship) and even if there are multiple paths to one attribute in Contact Builder / Data Designer. I debugged and tested this issue together with Dave Hacker, who is Sr. Technical Product Manager, Data Products at Salesforce Marketing Cloud. He confirmed that his team is working on a fix, where the desired path in contact model can be selected in the Marketing Cloud user interface. However this fix won't be released before the end of the 2017. Furthermore the team at Salesforce Marketing Cloud is currently working on documenting the issue and known workarounds in this [Salesforce Success Article](https://success.salesforce.com/issues_view?id=a1p3A000000f6KZQAY&title=query-engine-needs-to-accept-pathing-information-in-filter).

As mentioned in the Marketing Cloud documentation under [Create Custom Activities](https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-app-development.meta/mc-app-development/creating-activities.htm), it is possible to build custom splits, so I thought I'll just go ahead and give it a shot and as it turned out this solved the problem and can be used as a workaround until the path selection feature is released.

## Setup

1. Prepare deployment (gather knowledge of the URL the application will be hosted, etc.) to a server you manage or any Node.js-ready cloud service like [heroku.com](https://www.heroku.com). (*Note:* this example-application is already prepared to be deployed to heroku, so this is the easiest option. Furthermore you don't have to worry about SSL-setup when using heroku.)
2. Before this example can be used, a package containing a Journey Builder Activity needs to be created in [Salesforce Marketing Cloud App Center](https://appcenter-auth.s1.marketingcloudapps.com). A documentation for this task can be found here: [Create a Marketing Cloud App](https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-app-development.meta/mc-app-development/create-a-mc-app.htm).
	- __Important__: The activity's "Public Extension"-setting needs to be set to "This application and other installed Applications" and the example needs to be available via HTTPS which has to be running on the default port 443.
3. To secure the backend and make sure only requests from your marketing cloud instance are processed, you need to create a salt key in marketing cloud.
	- Information can be found in the documentation on [Key Management](http://help.marketingcloud.com/en/documentation/marketing_cloud/administration/keymanagement/) and [Encode with Customer Key](https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-app-development.meta/mc-app-development/encode-custom-activities-using-jwt-customer-key.htm). Follow these steps and add your salt key's ascii representation to package.json under `options.salesforce.marketingCloud.jwtSecret`, as well as the external key seen in Key Management to all the `customerKey`-properties in public/config.json.
	- __Important__: According to the documentation the salt key can be converted by piping it to `xxd -p` and adding `0x` as prefix. However in my tests on MacOS and CentOS the last two characters `0a` had to be removed, so I propose to use `echo "Hello world" | xxd -p | sed 's/^/0x/;s/0a$//'` instead, where `Hello world` would be your salt.
4. The unique key of the created Journey Builder Activity needs to be added to public/config.json properties `key` and `configurationArguments.applicationExtensionKey`
5. Replace `<URL OF THE SERVER RUNNING THE BACKEND>` in public/config.json with the URL where your split's backend can be reached (unless deployed to heroku or a similar service, you need to make sure this express app is eihter altered to run using https on port 443 or proxy it on your own (e.g. using nginx)).
6. Adapt the `outcomes` of the split in public/config.json according to your needs.
7. Add your Service Cloud credentials to package.json under `options.salesforce.serviceCloud.username` and `options.salesforce.serviceCloud.password`.
8. Adapt backed/lib/sfdc.js and backend/server.js so the desired object and field from Service Cloud is read and the outcome is returned accordingly.
9. Change the module name of the backend in package.json
10. _Optional_: Replace the icons for the custom activity in public/images.
11. Deploy the application to the service you selected in step 1.
12. Make sure the server hosting the backend is allowed to access to your Service Cloud instance (Setup -> Administration Setup -> Security Controls -> Network Access). Otherwise you will get an error as soon as the backend tries to login.

## Usage

1. If the setup in App Center has been done correctly and the files are available under the specified endpoint you should be able to see the custom split when editing a journey in journey builder alsongside the other _Flow Control_ activities.
2. Drag the split to your journey and click on it to configure it.
	- The retrieval of the _Event Definition Key_ works automatically, so just check if a reasonable value has been retrieved.
	![Event Definition Key Selection](documentation-resources/wizard_event_definition_key.png?raw=true "Event Definition Key Selection")
	- In the next step you need to provide the Id that is supposed to be passed to the split's backend. This is the name of the entry event's data extension column containing the Id of the Service Cloud object to query. If your entry event is a Salesforce Data entry event, you can easily select the desired column in a dropdown. If it is a different type of entry event, you need to type the column name in the provided input field.
	![ID Selection - Dropdown](documentation-resources/wizard_id_selection.png?raw=true "ID Selection - Dropdown")
	![ID Selection - Input](documentation-resources/wizard_id_selection_other_entry.png?raw=true "ID Selection - Input")
3. Finish building your journey and activate it.

## Contributors

|Major Contributors | |
|:----|----:|
|Markus Slabina |[![mslabina on Twitter](https://raw.githubusercontent.com/ExactTarget/fuelux/gh-pages/invertobird-sm.png)](https://twitter.com/mslabina) [![mslabina on Github](https://raw.githubusercontent.com/ExactTarget/fuelux/gh-pages/invertocat-sm.png)](https://github.com/mslabina) |

## License (MIT)

__Copyright © 2018 [Markus Slabina](https://github.com/mslabina)__

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
