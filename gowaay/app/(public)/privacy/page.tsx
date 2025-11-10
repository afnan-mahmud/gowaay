export default function PrivacyPolicy() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
      <p className="text-xl text-gray-600 mb-8">How we collect and use your information</p>
      
      <div className="prose prose-gray max-w-none">
        
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-600 p-6 mb-10 rounded-r-lg">
          <p className="text-gray-800 font-bold text-lg mb-3">Welcome to GoWaay!</p>
          <p className="text-gray-700 leading-relaxed">
            GoWaay, a government-licensed proprietorship company ("GoWaay," "we," "us," or "our"), 
            is dedicated to safeguarding the privacy and security of your data and information. We have created 
            this Privacy Policy to help you understand how we collect, store, process, share, and utilize your 
            data and information when you use our Platform and Services.
          </p>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        
        <p className="text-gray-700 mb-6 leading-relaxed">
          Terms that are capitalized but not defined in this Privacy Policy have the meanings provided in our 
          Terms & Conditions.
        </p>
        
        <p className="text-gray-700 mb-6 leading-relaxed">
          Please carefully review the terms outlined below, as they explain how GoWaay collects, stores, 
          processes, shares, and utilizes your data and information in connection with your use of the Platform 
          and Services.
        </p>
        
        <p className="text-gray-700 mb-8 leading-relaxed font-medium">
          By continuing to use the Platform or access the Services, you acknowledge that you have read, understood, 
          and agree to be legally bound by the provisions of this Privacy Policy and the accompanying Terms & Conditions.
        </p>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8 rounded-r-lg">
          <p className="text-gray-800 font-semibold mb-3">Important Notice:</p>
          <p className="text-gray-700 mb-3">
            We are not responsible for, and shall not be held liable for, any privacy practices or statements on 
            websites, mobile applications, or platforms not owned, operated, or controlled by us. You acknowledge 
            that GoWaay shall not be held liable for the actions of third-party individuals or entities.
          </p>
          <p className="text-gray-700">
            The Platform may occasionally provide links to third-party websites. If you access those links, you will 
            leave our Platform. We do not control those websites or their privacy practices, which may differ from ours. 
            This Privacy Policy does not cover any personal or identity information you may disclose on third-party websites.
          </p>
        </div>
        
        <p className="text-gray-700 mb-6">
          GoWaay reserves the right to supplement, amend, modify, or update this Privacy Policy at its sole 
          discretion. Any changes shall be deemed effective from the date they are published on the Platform. You 
          acknowledge that it is your responsibility to regularly review this Privacy Policy to stay informed of any 
          updates or modifications.
        </p>
        
        <p className="text-gray-700 mb-6">
          This Privacy Policy is subject to the applicable laws of Bangladesh and the specific region in which the 
          Platform is accessed or the Services are utilized.
        </p>
        
        <p className="text-gray-700 mb-10">
          For additional information about our policies and practices regarding the use or control of information you 
          share with us, please contact us at <a href="mailto:support@gowaay.com" className="text-brand hover:underline font-medium">support@gowaay.com</a>
        </p>

        {/* Section 1: Information Collection */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">1. INFORMATION WE COLLECT AND RETAIN</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1.1 Personal Information</h3>
              <p className="text-gray-700 mb-3">
                We may collect, retain, process, share, and/or utilize information that you provide while using the 
                Platform or accessing the Services. This includes, but is not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Personal and identity information (name, date of birth, gender, occupation, security questions)</li>
                <li>Location and property details (ownership information and historical data)</li>
                <li>Payment information (including payment verification details where applicable)</li>
                <li>Contact details (mobile number, email address, mailing address, office or residential address)</li>
                <li>National Identity Card (NID), passport details, or other government-issued identification documents</li>
                <li>Any other information required by applicable laws, government policies, or necessary to provide Services</li>
              </ul>
              <p className="text-gray-700">
                This information is collectively referred to as <strong>"Personal Information."</strong>
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1.2 Usage and Interaction Information</h3>
              <p className="text-gray-700 mb-3">
                We may collect information that you provide when you:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Contact our customer support service</li>
                <li>Provide ratings, reviews, or feedback to other Platform users</li>
                <li>Participate in surveys, promotions, or interactive activities</li>
                <li>Use the Services and Platform, including your usage history and associated information (senders' and recipients' location details, timestamps, etc.)</li>
                <li>Allow access to your contact address books, calendar information, and similar data</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1.3 Automatically Collected Information</h3>
              <p className="text-gray-700 mb-3">
                Information captured and stored automatically by your web browser or mobile operating system, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Language preferences and software/hardware attributes</li>
                <li>IP address, device location, and demographic information</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Information gathered by Google Analytics or other analytical software</li>
                <li>Page visit duration, sections viewed, and similar usage data</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1.4 Location and Device Information</h3>
              <p className="text-gray-700 mb-4">
                We may collect information depending on the Services you are accessing and your device settings and 
                permissions. This includes data obtained through Wi-Fi connections, IP addresses, and/or GPS. For mobile 
                devices, we collect such information when the mobile application is running in either the foreground or background.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700">
                  <strong>Your Control:</strong> You may refuse permission or withdraw consent for collecting such information 
                  by disabling permissions in your mobile device settings. However, this may limit Platform functionality or 
                  restrict feature usage, for which we shall not be liable. Even with disabled permissions, we may obtain 
                  approximate location information from other Platform users if you are using our Services.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1.5 Third-Party Analytics</h3>
              <p className="text-gray-700 mb-4">
                We may use third-party analytics services such as Google Analytics, Kissmetrics, or other analytical tools 
                to analyze visitor activities on our website. When information is shared with such third parties, their 
                privacy policies govern the use and retention of your information to the extent it is shared with them.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1.6 Anonymous Information</h3>
              <p className="text-gray-700 mb-4">
                We may also collect anonymized information to improve our Services and enhance the quality of our users' experience.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1.7 Third-Party Service Providers</h3>
              <p className="text-gray-700 mb-4">
                When availing Services, you may be introduced to third-party service providers through the Platform. The 
                privacy policies of such providers are not under our control. Any interaction with, or collection and 
                retention of information by, such providers shall be governed by their privacy policies. We shall not be 
                responsible for any breach of privacy or security by such providers. Our association with third-party 
                service providers does not make us liable for their privacy or security breaches.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1.8 Sensitive Information</h3>
              <p className="text-gray-700 mb-4">
                We do not intentionally collect sensitive personal information such as race, religion, political affiliation, 
                or medical information. However, any such information obtained incidentally shall be afforded the same 
                protection as other information we collect and retain.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1.9 Additional Information</h3>
              <p className="text-gray-700 mb-4">
                We may request additional information from time to time for specific purposes, such as running promotions 
                or conducting surveys. In such cases, you will have the choice to provide or withhold such information. 
                If provided, it shall receive the same protection as other information we collect and retain.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1.10 Voluntary Provision</h3>
              <p className="text-gray-700 mb-4">
                Personal Information and Other Information (as defined in sections 1.2 to 1.9) shall be deemed to have 
                been provided by you voluntarily.
              </p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1.11 Security Measures and Disclaimers</h3>
              <p className="text-gray-700 mb-3">
                We shall endeavor to take all commercially reasonable measures to protect the Personal Information and 
                Other Information in our possession from unauthorized use, access, disclosure, alteration, or destruction.
              </p>
              <p className="text-gray-700 font-semibold">
                However, no security system is completely impenetrable. Therefore, GoWaay cannot guarantee, and takes 
                no responsibility for, the absolute security of its databases. We cannot guarantee that Personal Information 
                and Other Information you provide will not be intercepted during internet transmission. We disclaim all 
                liability and responsibility regarding the collection, retention, processing, transmission, or use of 
                Personal Information and Other Information.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Consent */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">2. CONSENT</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Agreement to Collection and Use</h3>
              <p className="text-gray-700 mb-4">
                You hereby agree that the Personal Information and Other Information we collect or otherwise receive 
                through the Platform may be used for the purposes described in this Privacy Policy or the Terms & Conditions, 
                or disclosed where such disclosure is necessary or required under applicable laws or by any law enforcement agency.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Right to Refuse or Withdraw Consent</h3>
              <p className="text-gray-700 mb-3">
                You may refuse to provide consent for collecting, retaining, processing, transmitting, and/or using 
                Personal Information and/or Other Information, or withdraw consent by providing reasonable notice.
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700">
                  <strong>Important:</strong> If you refuse or withdraw consent, you will no longer be able to use the 
                  Platform or access the Services. You may also block or disable cookies on the Platform or limit device 
                  settings and permissions. However, doing so may interfere with and restrict Platform functionality.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 Accuracy of Information</h3>
              <p className="text-gray-700 mb-4">
                You agree that the Personal Information provided to us is correct, accurate, and up-to-date at all times. 
                If any information becomes outdated or incorrect, you agree to update such information immediately.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.4 Data Sharing Notification</h3>
              <p className="text-gray-700 mb-4">
                We may share your data collected pursuant to this Privacy Policy only after prior notification. If you do 
                not want your data to be shared, you may need to cease using the Platform or accessing the Services. We 
                encourage you to contact our customer service support team before opting out.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Disclosure */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">3. DISCLOSURE</h2>
          </div>
          
          <div>
            <p className="text-gray-700 mb-4">
              We reserve the right to disclose information we collect about you, and you hereby agree to such disclosure, 
              in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-3 mb-4">
              <li>
                <strong>Legal Obligation:</strong> When we are obligated to do so under applicable laws, to the extent 
                such disclosure is necessary
              </li>
              <li>
                <strong>Legal Orders:</strong> When we are obligated by an order from law enforcement agencies, 
                governmental agencies, or courts, to the extent such order requires disclosure
              </li>
              <li>
                <strong>Safety and Security:</strong> When we consider it necessary to prevent unlawful activity or to 
                address safety or security concerns
              </li>
              <li>
                <strong>Platform Users:</strong> We may disclose certain information with other users of the Platform 
                who are availing Services
              </li>
            </ul>
            <p className="text-gray-700 font-medium">
              You hereby agree to all such disclosures as described above.
            </p>
          </div>
        </section>

        {/* Section 4: Retention Duration */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">4. DURATION OF RETENTION</h2>
          </div>
          
          <p className="text-gray-700 mb-4">
            We will retain your information for as long as it is necessary to provide you and other Platform users with 
            Services, or as required by applicable laws. Retention periods may vary depending on the type of information 
            and the purpose for which it was collected.
          </p>
        </section>

        {/* Section 5: How We Use Information */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">5. HOW WE MAY USE THE INFORMATION</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Identity Verification and Service Provision</h3>
              <p className="text-gray-700 mb-4">
                We may use Personal Information to verify your identity and maintain records for security and safety purposes. 
                We will use Personal Information and Other Information to provide, operate, and improve the Services.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Communications</h3>
              <p className="text-gray-700 mb-3">
                We may use Personal Information and Other Information to send you newsletters, updates, or other information 
                periodically. You have full control over whether to receive such communications and can change your 
                preferences or unsubscribe at any time through your account settings.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Note:</strong> If you have provided an incorrect email address or phone number, or if these 
                  details have changed without prior notification to us, you may not receive communications. GoWaay 
                  shall not be responsible for failure to communicate information or for communications going to incorrect 
                  contact details.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Customer Support</h3>
              <p className="text-gray-700 mb-4">
                Your Personal Information may be used to provide customer support services and respond to your inquiries 
                from time to time.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.4 Payment Processing</h3>
              <p className="text-gray-700 mb-4">
                We will use your payment details to facilitate and process payments for Services being accessed through 
                our Platform. We may also use your transaction history and payment details, where necessary, to detect, 
                prevent, and combat illegal activity, and to provide law enforcement agencies with assistance if required.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.5 Research, Development, and Marketing</h3>
              <p className="text-gray-700 mb-4">
                We may use Personal Information and Other Information for safety and security purposes, to conduct research 
                and analysis, and for product development to provide you with improved Services. We may also use this 
                information for advertising or promotional purposes.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.6 Sharing with Service Providers</h3>
              <p className="text-gray-700 mb-4">
                We may share or provide restricted access to certain information with vendors, consultants, and other 
                service providers who require access to perform work on our behalf as requested through the Platform. 
                We may also share information with partner companies, third-party business partners, and affiliates, 
                whether in Bangladesh or abroad, to assist in:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Providing our Services</li>
                <li>Designing and operating the Platform</li>
                <li>Storing, processing, or analyzing data</li>
                <li>Implementing cookies for data usage analysis</li>
                <li>Providing data storage solutions</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.7 Third-Party Offers</h3>
              <p className="text-gray-700 mb-4">
                We may, from time to time, contact you on behalf of third-party business partners and other entities 
                regarding offers that may be of interest to you.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.8 International Data Transfer</h3>
              <p className="text-gray-700 mb-4">
                We reserve the right to transfer Personal Information and Other Information to any country outside 
                Bangladesh to the fullest extent permitted by the laws of Bangladesh.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Your Responsibility */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">6. YOUR RESPONSIBILITY</h2>
          </div>
          
          <p className="text-gray-700 mb-4">
            Notwithstanding anything contained in this Privacy Policy or the Terms & Conditions, you shall at all times 
            be responsible for the Personal Information and Other Information that you provide to us or otherwise make 
            available on the Platform.
          </p>
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
            <p className="text-gray-700 font-semibold">
              You shall be solely liable for any civil claim or criminal prosecution arising from any content you make 
              available on the Platform or provide to us.
            </p>
          </div>
        </section>

        {/* Section 7: Acceptance */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">7. ACCEPTANCE AND AGREEMENT</h2>
          </div>
          
          <p className="text-gray-700 mb-4">
            By accessing or using the Platform and availing the Services, you hereby expressly and unequivocally accept 
            that you have read, understood, and agreed to each of the terms and conditions of this Privacy Policy.
          </p>
          <p className="text-gray-700 font-semibold">
            Such acceptance constitutes a valid and legally binding assent to each of the terms and conditions of this 
            Privacy Policy.
          </p>
        </section>

        {/* Contact Section */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-8 rounded-lg border-2 border-red-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>
            
            <p className="text-gray-700 mb-6">
              If you have any queries or would like to share your views, comments, or complaints, please contact us 
              with your full name, contact number, and details of your query, views, comments, or complaints.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Get In Touch</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <strong>Email:</strong> <a href="mailto:support@gowaay.com" className="text-brand hover:underline">support@gowaay.com</a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Phone:</strong> <a href="tel:+8801611553628" className="text-brand hover:underline">+8801611553628</a>
                  </p>
                  <p className="text-gray-700">
                    <strong>WhatsApp:</strong> <a href="https://wa.me/8801611553628" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">+8801611553628</a>
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Our Office</h3>
                <p className="text-gray-700">
                  House 37, Road 07, Sector 03<br />
                  Uttara, Dhaka-1230<br />
                  Bangladesh
                </p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-700 text-sm">
                <strong>Response Time:</strong> We will endeavor to respond to all inquiries as soon as possible, 
                but in any case within <strong>14 working days</strong> of receipt of your communication.
              </p>
            </div>
            
            <p className="text-gray-700 mt-4 text-center font-medium">
              We are always happy to help!
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="bg-gray-100 border-2 border-gray-300 p-6 rounded-lg text-center mt-10">
          <p className="text-gray-600 text-sm mb-2">
            © {new Date().getFullYear()} GoWaay. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs">
            This Privacy Policy is part of our Terms & Conditions and should be read in conjunction with them.
          </p>
        </div>
      </div>
    </div>
  );
}
