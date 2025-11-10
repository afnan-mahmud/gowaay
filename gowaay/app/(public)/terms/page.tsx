export default function TermsAndConditions() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
      
      <p className="text-gray-600 mb-4">Please read these terms carefully before using our service.</p>
      
      <p className="text-sm text-gray-500 mb-8">
        <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-10">
        <p className="text-gray-800 font-semibold mb-3">Thank you for choosing GoWaay!</p>
        <p className="text-gray-700 leading-relaxed">
          GoWaay is a government-licensed proprietorship company operating under the business name "GoWaay," 
          duly registered and licensed under the laws of Bangladesh. These Terms & Conditions ("Terms") constitute 
          a legally binding agreement between you and GoWaay governing your use of our website, mobile applications, 
          and all related services (collectively referred to as the "GoWaay Platform"). All references to 
          "GoWaay," "we," "us," or "our" herein refer to GoWaay, the government-licensed proprietorship 
          company responsible for the operation and management of this platform.
        </p>
      </div>

      <div className="prose prose-gray max-w-none">
        {/* Definitions Section */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Definitions and Key Terms</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-700 mb-2">
                <strong className="text-gray-900">Platform:</strong> GoWaay operates as an online marketplace 
                connecting registered users ("Members" and "Property Owners") to facilitate transactions for 
                accommodation services throughout Bangladesh.
              </p>
            </div>

            <div>
              <p className="text-gray-700 mb-2">
                <strong className="text-gray-900">Company:</strong> "GoWaay" or "Company" refers to the 
                government-licensed proprietorship company operating under the business name "GoWaay," 
                the business entity entering into this agreement with users of the platform.
              </p>
            </div>

            <div>
              <p className="text-gray-700 mb-2">
                <strong className="text-gray-900">Member/Guest/User:</strong> Any individual who reserves accommodation 
                services provided by Property Owners through the GoWaay Platform using a registered account. This 
                includes any accompanying individuals such as family members, friends, colleagues, or other guests.
              </p>
            </div>

            <div>
              <p className="text-gray-700 mb-2">
                <strong className="text-gray-900">Property Owner/Host:</strong> An individual or entity offering 
                accommodation services via the GoWaay Platform through their verified account. This encompasses 
                anyone providing lodging or related services to Members.
              </p>
            </div>

            <div>
              <p className="text-gray-700 mb-2">
                <strong className="text-gray-900">Property Services:</strong> Services offered by Property Owners through 
                our platform, including but not limited to:
              </p>
              <ul className="list-disc pl-8 text-gray-700 space-y-1 mt-2">
                <li>Short-term or long-term accommodation rentals</li>
                <li>Apartments, rooms, and residential properties</li>
                <li>Hotels and guesthouses</li>
                <li>Other hospitality-related services</li>
              </ul>
            </div>

            <div>
              <p className="text-gray-700 mb-2">
                <strong className="text-gray-900">Listings:</strong> The publication and display of Property Services 
                on the GoWaay Platform, including detailed descriptions, pricing, availability, and terms under 
                which services are offered to potential Guests.
              </p>
            </div>

            <div>
              <p className="text-gray-700 mb-2">
                <strong className="text-gray-900">Booking:</strong> When a Guest reserves Property Services listed by 
                a Property Owner on the platform, it creates a binding contractual agreement between the Guest and 
                the Property Owner upon confirmation.
              </p>
            </div>

            <div>
              <p className="text-gray-700 mb-2">
                <strong className="text-gray-900">Accommodation:</strong> Any room, suite, apartment, house, or building 
                where an individual may reside or stay temporarily.
              </p>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="mb-10 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Table of Contents</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Guest Terms</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>1. Our Vision</li>
                <li>2. Searching and Reserving Accommodations</li>
                <li>3. Cancellations, Refunds, and Modifications</li>
                <li>4. Guest Responsibilities and Risk Acknowledgment</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Property Owner Terms</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>5. Hosting on GoWaay</li>
                <li>6. Managing Your Property Listing</li>
                <li>7. Cancellations and Modifications</li>
                <li>8. Tax Obligations</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">General Terms</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>9. Ratings and Reviews</li>
                <li>10. User-Generated Content</li>
                <li>11. Service Fees</li>
                <li>12. Platform Usage Rules</li>
              </ul>
            </div>
            
            <div>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>13. Account Suspension and Termination</li>
                <li>14. Modifications to Terms</li>
                <li>15. Our Role as Platform Provider</li>
                <li>16. Account Management</li>
                <li>17-20. Legal Terms</li>
              </ul>
            </div>
          </div>
        </section>

        {/* GUEST TERMS */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Guest Terms</h2>
        </div>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. Our Vision</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our mission at GoWaay is to create a Bangladesh where comfortable, affordable accommodation is 
            accessible to everyone, everywhere. Whether you're seeking apartments, private rooms, or hotel stays, 
            explore millions of listings to find spaces that match your travel preferences and budget. Learn about 
            each property through detailed descriptions, high-quality images, owner profiles, and authentic guest 
            reviews. Have questions? Connect directly with Property Owners through our messaging system.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. Searching and Reserving Accommodations</h3>
          
          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.1 Search Functionality</h4>
          <p className="text-gray-700 mb-4">
            Search for properties using various criteria including destination, dates, guest count, and property type. 
            Search results are prioritized based on relevance to your query, considering factors such as pricing, 
            availability, guest reviews, property owner requirements (minimum/maximum night stays), instant booking 
            availability, and property ratings.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Reservation Process</h4>
          <p className="text-gray-700 mb-4">
            When you complete a booking, you agree to pay all associated charges, including the listing price, 
            applicable service fees, taxes, and any additional charges presented at checkout (the "Total Amount"). 
            Upon confirmation, a contractual agreement ("Reservation") is established directly between you and the 
            Property Owner. You must comply with all terms of the Reservation, including cancellation policies, 
            house rules, and any specific requirements outlined in the listing. Some Property Owners may work with 
            co-hosts or property management teams.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.3 Accommodation Bookings</h4>
          <p className="text-gray-700 mb-4">
            Your reservation grants you a limited license to occupy the accommodation for the specified period. 
            Property Owners retain the right to access the property when reasonably necessary, as permitted by your 
            agreement and applicable law. Overstaying beyond checkout may result in additional charges. You must not 
            exceed the maximum occupancy specified in the listing.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. Cancellations, Refunds, and Modifications</h3>
          
          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.1 Guest Cancellations and Refunds</h4>
          <p className="text-gray-700 mb-4">
            When you cancel a reservation, the refund amount is determined by the cancellation policy applicable to 
            that booking. In exceptional circumstances beyond your control, you may qualify for a partial or full 
            refund. If a Property Owner cancels your confirmed booking or you encounter a significant issue as 
            defined in our Refund Policy, you may be eligible for rebooking assistance or refunds.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Booking Modifications</h4>
          <p className="text-gray-700 mb-4">
            Both Guests and Property Owners are responsible for any modifications made through the platform or via 
            customer service. Additional fees, charges, or taxes resulting from modifications must be paid by the 
            requesting party.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. Guest Responsibilities and Risk Acknowledgment</h3>
          
          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 Your Obligations</h4>
          <p className="text-gray-700 mb-4">
            You are fully responsible for your actions and those of anyone you invite or bring to the accommodation. 
            This includes: (i) leaving the property in the same condition as upon arrival, (ii) acting with integrity 
            and respect toward others, and (iii) complying with all applicable laws. If bringing minors, you must have 
            legal authority and are solely responsible for their supervision.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Risk Acknowledgment</h4>
          <p className="text-gray-700 mb-4">
            You acknowledge that using accommodations involves inherent risks. To the maximum extent permitted by law, 
            you assume all risks associated with platform use, property stays, and interactions with other members. 
            You are solely responsible for evaluating property suitability for your needs. Property stays may involve 
            risks of illness, injury, or other harm, which you voluntarily accept by proceeding with your booking.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Identity Verification Requirements</h4>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
            <p className="text-gray-700 mb-3">
              To maintain platform security and trust, all guests must provide valid identification during registration:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Clear images of both sides of your National ID Card (NID)</li>
              <li>A selfie photograph for verification purposes</li>
              <li>Must carry NID during your stay and present it to Property Owners upon request</li>
              <li>Incomplete or unverifiable identification may result in service limitations</li>
            </ul>
            <p className="text-gray-700 mt-3">
              You accept full responsibility for all activities under your account. This requirement ensures a secure 
              environment for all community members.
            </p>
          </div>
        </section>

        {/* PROPERTY OWNER TERMS */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg mb-8 mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Property Owner Terms</h2>
        </div>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">5. Hosting on GoWaay</h3>
          
          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.1 Property Owner Privileges</h4>
          <p className="text-gray-700 mb-4">
            As a Property Owner, GoWaay grants you the privilege to use our platform to connect your properties 
            with our community of guests and generate income. Creating listings is straightforward, and you maintain 
            complete control over your hosting - set your own prices, availability, and house rules.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Direct Contracts with Guests</h4>
          <p className="text-gray-700 mb-4">
            Upon accepting a booking request or receiving confirmation, you enter into a direct contract with the Guest. 
            You are responsible for delivering services according to your listing's terms and pricing. You also agree 
            to pay applicable service fees and taxes for each confirmed booking. GoWaay Payments will deduct amounts 
            owed from your earnings. Any additional terms you include must align with these Terms and be clearly stated 
            in your listing.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.3 Independent Status</h4>
          <p className="text-gray-700 mb-4">
            Your relationship with GoWaay is that of an independent service provider, not an employee, agent, or 
            partner, except where GoWaay Payments acts as a payment collection agent. GoWaay does not control 
            or direct your property services. You have full discretion over whether, when, and how to provide services.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">6. Managing Your Property Listing</h3>
          
          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.1 Creating and Maintaining Listings</h4>
          <p className="text-gray-700 mb-4">
            Our platform provides comprehensive tools for creating and managing listings. Your listing must contain 
            complete, accurate information about your property, pricing, and any applicable rules or requirements. 
            Keep your listing details, including calendar availability and photos, current and accurate at all times. 
            We recommend obtaining appropriate insurance for your properties.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.2 Legal Compliance</h4>
          <p className="text-gray-700 mb-4">
            You are responsible for understanding and complying with all laws, regulations, and agreements applicable 
            to your listing. This includes:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Lease agreements and landlord permissions</li>
            <li>Homeowner association rules and regulations</li>
            <li>Municipal zoning laws and short-term rental regulations</li>
            <li>Business licensing and registration requirements</li>
            <li>Building codes and safety regulations</li>
            <li>Privacy laws regarding guest data handling</li>
            <li>Extended stay and tenancy laws</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Information provided by GoWaay about legal requirements is for informational purposes only. You must 
            independently verify your legal obligations and seek legal counsel when necessary.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.3 Search Result Rankings</h4>
          <p className="text-gray-700 mb-4">
            Listing positions in search results depend on multiple factors:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Guest search parameters (dates, location, guest count)</li>
            <li>Property characteristics (availability, reviews, property type, verification status, listing age)</li>
            <li>Booking convenience (customer service history, cancellation record, instant booking)</li>
            <li>Property requirements (minimum stays, booking deadlines)</li>
            <li>Guest preferences (previous bookings, search location)</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Rankings may differ between mobile apps and website. Property Owners may enhance visibility through 
            promotional placements for additional fees.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.4 Property Owner Responsibilities</h4>
          <p className="text-gray-700 mb-4">
            You are accountable for your actions and those of anyone assisting you. You must accurately describe all 
            fees in your listing and cannot charge additional fees outside the platform. Do not encourage guests to 
            create external accounts, provide contact information, or conduct transactions off-platform.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.5 Team Hosting</h4>
          <p className="text-gray-700 mb-4">
            If you host as a team, business, or organization, each individual and the entity are responsible as Property 
            Owners under these Terms. When accepting terms or entering contracts, you warrant that you have authority 
            to bind your team or organization, and that all entities are in good legal standing.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.6 Risk Acknowledgment</h4>
          <p className="text-gray-700 mb-4">
            You acknowledge that hosting involves inherent risks and agree that you assume all risks associated with 
            using the platform, offering property services, and interacting with members. You acknowledge that you've 
            had the opportunity to investigate applicable laws and regulations independently.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">7. Cancellations and Modifications</h3>
          
          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.1 Cancellation Policies</h4>
          <p className="text-gray-700 mb-4">
            Generally, amounts paid to you depend on the cancellation policy for each booking. You should not cancel 
            on guests without valid legal reasons. Unjustified cancellations may result in fees and other consequences. 
            If guests experience issues or if bookings are cancelled under these Terms, your payout will be reduced by 
            refund amounts and associated costs. GoWaay may recover amounts through future payout offsets.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">7.2 Modification Responsibilities</h4>
          <p className="text-gray-700 mb-4">
            Property Owners and Guests are responsible for any modifications they agree to make and must pay any 
            additional associated costs.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">8. Tax Obligations</h3>
          
          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.1 Property Owner Tax Responsibilities</h4>
          <p className="text-gray-700 mb-4">
            As a Property Owner, you are responsible for determining and fulfilling all tax obligations under applicable 
            laws, including reporting, collecting, remitting, or including in your pricing any applicable VAT, income 
            tax, occupancy taxes, tourism taxes, or other applicable taxes.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.2 Tax Documentation</h4>
          <p className="text-gray-700 mb-4">
            In certain jurisdictions, tax regulations may require us to collect tax information, report taxes, or 
            withhold taxes from payouts. Failure to provide adequate documentation may result in payout withholding 
            as required by law. GoWaay may issue invoices or similar documentation on your behalf to facilitate 
            accurate tax reporting.
          </p>
        </section>

        {/* GENERAL TERMS */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg mb-8 mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">General Terms</h2>
        </div>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">9. Ratings and Reviews</h3>
          <p className="text-gray-700 mb-4">
            Guests and Property Owners may submit public ratings and reviews within a designated timeframe after 
            booking completion. These represent individual opinions and do not reflect GoWaay's views. We do 
            not verify review accuracy, and reviews may occasionally be incorrect or misleading.
          </p>
          <p className="text-gray-700 mb-4">
            Reviews must be honest, accurate, and may not contain discriminatory, offensive, defamatory, or inappropriate 
            language. Manipulating the review system, including arranging for third-party reviews, constitutes fraud 
            and may result in legal action.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">10. User-Generated Content</h3>
          <p className="text-gray-700 mb-4">
            The platform enables you to submit various forms of content including feedback, text, photos, audio, video, 
            and other information. By providing content, you grant GoWaay a non-exclusive, worldwide, royalty-free, 
            perpetual, sub-licensable, and transferable license to use, copy, modify, distribute, publish, and exploit 
            that content without limitation.
          </p>
          <p className="text-gray-700 mb-4">
            You are solely responsible for your content and warrant that you own it or have authorization to grant these 
            rights. You are liable if your content violates intellectual property or privacy rights. Content must comply 
            with our Content Policy prohibiting discriminatory, obscene, harassing, deceptive, violent, or illegal material.
          </p>
          <p className="text-gray-700 mb-4">
            We may provide translation services or tools for content. We do not guarantee translation accuracy or quality, 
            and members are responsible for verifying translations.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">11. Service Fees</h3>
          <p className="text-gray-700 mb-4">
            GoWaay charges service fees (and applicable taxes) to Property Owners and Guests for platform use. 
            Detailed information about fee calculation and application is available on our Service Fees page. Unless 
            otherwise specified, service fees are non-refundable.
          </p>
          <p className="text-gray-700 mb-4">
            We reserve the right to modify service fees with advance notice to members. Fee changes do not affect 
            bookings made before the change takes effect. You may terminate this agreement if you disagree with fee 
            changes.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">12. Platform Usage Rules</h3>
          
          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.1 Required Conduct</h4>
          <p className="text-gray-700 mb-3">You must adhere to these rules and not assist others in violating them:</p>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-4">
            <p className="font-semibold text-gray-800 mb-3">DO:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Act with integrity and treat others respectfully</li>
              <li>Provide honest and accurate information</li>
              <li>Communicate politely and respectfully</li>
              <li>Honor all legal obligations</li>
              <li>Comply with applicable privacy and data protection laws</li>
              <li>Use member information only as necessary for transactions</li>
            </ul>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-4">
            <p className="font-semibold text-gray-800 mb-3">DO NOT:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Lie, misrepresent, or impersonate others</li>
              <li>Scrape, hack, reverse engineer, or compromise the platform</li>
              <li>Use bots, crawlers, or automated data collection tools</li>
              <li>Circumvent security or technological measures</li>
              <li>Decompile or reverse engineer software or hardware</li>
              <li>Damage platform performance or functionality</li>
              <li>Use member information for unauthorized commercial messages</li>
              <li>Request or accept bookings outside the platform to avoid fees</li>
              <li>Encourage external reviews or third-party account creation</li>
              <li>Manipulate search algorithms</li>
              <li>Book properties without intending to use them</li>
              <li>Copy, display, or use platform content without permission</li>
              <li>Use GoWaay branding without authorization</li>
              <li>Organize unauthorized parties or events</li>
              <li>Offer services violating applicable laws</li>
              <li>Engage in or facilitate illegal activities</li>
            </ul>
          </div>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.2 Reporting Violations</h4>
          <p className="text-gray-700 mb-4">
            If you believe a member, listing, or content poses immediate harm, contact local authorities first, then 
            notify GoWaay. To report policy violations, use our reporting system. While we may request copies of 
            reports filed with authorities, we are not obligated to take action on all reports except as required by law.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.3 Copyright Notifications</h4>
          <p className="text-gray-700 mb-4">
            To report copyright infringement on the platform, please contact us through our designated channels.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">13. Account Suspension and Termination</h3>
          
          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">13.1 Agreement Duration</h4>
          <p className="text-gray-700 mb-4">
            This agreement becomes effective when you access the platform (e.g., creating an account) and continues 
            until terminated by either party according to these Terms.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">13.2 Termination Rights</h4>
          <p className="text-gray-700 mb-4">
            You may terminate at any time by contacting us at support@gowaay.com. GoWaay may terminate this 
            agreement immediately without notice if you breach these Terms, violate policies, infringe laws, or if we 
            reasonably believe termination is necessary to protect our interests, members, or third parties. Inactive 
            accounts (over one year) may be terminated without notice.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">13.3 Enforcement Actions</h4>
          <p className="text-gray-700 mb-4">
            If you breach these Terms, violate policies or laws, or if we believe action is necessary to protect 
            GoWaay, members, or third parties, we may:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li>Suspend or restrict platform access or account use</li>
            <li>Suspend or remove listings, reviews, or other content</li>
            <li>Cancel pending or confirmed bookings</li>
            <li>Suspend or revoke special account status</li>
          </ul>
          <p className="text-gray-700 mb-4">
            For minor violations, you'll receive notice and an opportunity to resolve issues. You may appeal enforcement 
            actions through customer service. Cancelled bookings under this section will result in reduced payouts by 
            refund amounts and associated costs.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">13.4 Legal Compliance</h4>
          <p className="text-gray-700 mb-4">
            GoWaay may take any action reasonably necessary to comply with applicable laws or court, law enforcement, 
            or governmental orders or requests.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">13.5 Termination Effects</h4>
          <p className="text-gray-700 mb-4">
            Property Owner terminations result in automatic cancellation of confirmed bookings with full guest refunds. 
            Guest terminations result in automatic booking cancellations with refunds per applicable cancellation policies. 
            Upon termination, you are not entitled to account or content restoration. Terminated users may not register 
            new accounts or use accounts of other members.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">13.6 Survival of Terms</h4>
          <p className="text-gray-700 mb-4">
            Provisions that by nature survive termination will remain effective after agreement termination.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">14. Modifications to Terms</h3>
          <p className="text-gray-700 mb-4">
            GoWaay may modify these Terms at any time. Updated Terms will be posted on the platform, and material 
            changes will be communicated via email. If you disagree with modifications, you may terminate immediately 
            by emailing us. Continued platform use after changes become effective constitutes acceptance of revised Terms.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">15. Our Role as Platform Provider</h3>
          <p className="text-gray-700 mb-4">
            We provide a platform enabling members to publish, offer, search for, and book property services. While we 
            strive to ensure excellent member experiences, we do not and cannot control member conduct. You acknowledge 
            that GoWaay has the right, but not the obligation, to monitor platform use and verify member information.
          </p>
          <p className="text-gray-700 mb-4">
            We may review, disable access to, remove, or edit content to: (i) operate, secure, and improve the platform 
            (including fraud prevention, risk assessment, investigation, and customer support); (ii) ensure member 
            compliance with these Terms; (iii) comply with applicable laws or legal requirements; (iv) address harmful 
            or objectionable content; (v) implement actions set forth in these Terms; and (vi) maintain and enforce 
            quality or eligibility criteria.
          </p>
          <p className="text-gray-700 mb-4">
            Members must cooperate with and assist GoWaay in good faith, providing requested information and taking 
            reasonable actions related to platform use investigations. GoWaay is not acting as an agent for any 
            member, except where GoWaay Payments functions as a collection agent as specified in the Payment Terms.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">16. Account Management</h3>
          <p className="text-gray-700 mb-4">
            To access many platform features, you must create an account. Registration is permitted for legal entities, 
            partnerships, and individuals at least 18 years old. By registering, you confirm compliance with your 
            jurisdiction's laws.
          </p>
          <p className="text-gray-700 mb-4">
            You must provide accurate, current, and complete registration information and keep account information updated. 
            Creating multiple accounts or transferring accounts to others is prohibited. You are responsible for maintaining 
            account confidentiality and security, and must promptly report suspected security breaches.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">17. Warranty Disclaimers</h3>
          <div className="bg-yellow-50 border-2 border-yellow-400 p-6 rounded-lg">
            <p className="text-gray-800 font-semibold mb-3">IMPORTANT NOTICE:</p>
            <p className="text-gray-700 mb-3">
              GoWaay provides the platform and content "AS IS" without warranties of any kind, express or implied. 
              We do not endorse or warrant the conduct, safety, quality, legality, or suitability of any member, property 
              service, or third party.
            </p>
            <p className="text-gray-700 mb-3">
              GoWaay does not warrant:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Uninterrupted or error-free platform performance</li>
              <li>Accuracy or completeness of verification processes</li>
              <li>Prevention of past or future misconduct</li>
              <li>Accuracy of property listings or descriptions</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Any "verification" references indicate only that relevant processes were completed, nothing more. 
              These disclaimers apply to the maximum extent permitted by applicable law.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">18. Liability Limitations</h3>
          <div className="bg-red-50 border-2 border-red-400 p-6 rounded-lg">
            <p className="text-gray-800 font-semibold mb-3">LIABILITY LIMITATIONS:</p>
            <p className="text-gray-700 mb-3">
              GoWaay, including our parent company, subsidiaries, affiliates, officers, directors, employees, agents, 
              and consultants (collectively, "GoWaay Entities"), as well as third-party service providers, shall not 
              be liable for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-3">
              <li>Lost profits, indirect, consequential, special, incidental, or punitive damages</li>
              <li>Damages arising from platform use or these Terms</li>
              <li>Breaches of these Terms by you or third parties</li>
              <li>Use of tools, services, or content provided by us or third-party providers</li>
              <li>User-generated content or member interactions</li>
              <li>Platform interactions with third-party sites, including social media</li>
              <li>Communications or transactions facilitated through the platform</li>
            </ul>
            <p className="text-gray-700 mb-3">
              These limitations apply regardless of legal theory and to the maximum extent permitted by law. GoWaay's 
              total liability for any claim arising from these Terms or platform use is limited to the amount paid for 
              the specific transaction giving rise to the claim.
            </p>
            <p className="text-gray-700 font-semibold">
              We do not own, operate, or manage any properties listed on our platform. We are not responsible for property 
              conditions, safety, or any issues arising from property stays.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">19. Indemnification</h3>
          
          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">19.1 Release from Claims</h4>
          <p className="text-gray-700 mb-4">
            In the event of disputes with other users, third-party service providers, or third-party websites linked to 
            the platform, you release GoWaay Entities from all claims, demands, and liabilities arising from such 
            disputes.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">19.2 Indemnification Obligations</h4>
          <p className="text-gray-700 mb-4">
            You agree to indemnify GoWaay against any liability arising from incidents between you and Property 
            Owners or service providers engaged through the platform. In cases of illegal activity during your stay, 
            appropriate actions will be taken by authorities according to Bangladeshi law. GoWaay is not liable for 
            criminal investigations related to member actions or inactions.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">19.3 Sole Remedy</h4>
          <p className="text-gray-700 mb-4">
            If you are dissatisfied with the platform, disagree with any Terms provision, or have disputes with us, 
            third-party providers, or other users, your sole remedy is to discontinue platform use.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">19.4 Defense Rights</h4>
          <p className="text-gray-700 mb-4">
            GoWaay reserves the right to assume exclusive defense and control of matters subject to indemnification 
            by you. You agree not to settle any such matters without our written consent.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">19.5 Criminal Activity Reporting</h4>
          <p className="text-gray-700 mb-4">
            In cases of criminal activity during stays, GoWaay is not liable as the platform provider. You are 
            responsible for reporting incidents to law enforcement authorities and notifying our Dispute Resolution 
            Center after filing reports.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">20. Additional Provisions</h3>
          
          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">20.1 Incorporated Terms</h4>
          <p className="text-gray-700 mb-4">
            Our Refund Policy, Content Policy, Community Standards, and other supplemental policies linked in these Terms 
            apply to platform use, are incorporated by reference, and form part of your agreement with GoWaay.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">20.2 Entire Agreement</h4>
          <p className="text-gray-700 mb-4">
            Except as supplemented by additional terms, conditions, and policies, these Terms constitute the entire 
            agreement between GoWaay and you regarding platform access and use. They supersede all prior oral or 
            written understandings or agreements. These Terms confer no rights or remedies upon anyone except you and 
            GoWaay.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">20.3 Severability</h4>
          <p className="text-gray-700 mb-4">
            If any provision is held invalid or unenforceable, such provision will be struck without affecting remaining 
            provisions' validity and enforceability.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">20.4 No Waiver</h4>
          <p className="text-gray-700 mb-4">
            GoWaay's failure to enforce any right or provision will not constitute a waiver unless acknowledged and 
            agreed to in writing. Exercising remedies under these Terms does not prejudice other remedies under these 
            Terms or applicable law.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">20.5 Assignment</h4>
          <p className="text-gray-700 mb-4">
            You may not assign, transfer, or delegate this agreement or your rights and obligations without GoWaay's 
            prior written consent. GoWaay may freely assign, transfer, or delegate this agreement and any rights and 
            obligations.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">20.6 Notice Provisions</h4>
          <p className="text-gray-700 mb-4">
            Unless otherwise specified, notices or communications to members will be provided electronically via email, 
            platform notification, messaging service (including SMS and WhatsApp), or any contact method you provide.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">20.7 Third-Party Services</h4>
          <p className="text-gray-700 mb-4">
            The platform may contain links to third-party services subject to different terms and privacy practices. 
            GoWaay is not responsible for any aspect of such services, and links do not imply endorsement.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">20.8 Platform Content Protection</h4>
          <p className="text-gray-700 mb-4">
            Platform content may be protected by copyright, trademark, and other laws. All intellectual property rights 
            belong to GoWaay and/or licensors. You may not remove, alter, or obscure proprietary rights notices. 
            Except as expressly permitted, you may not use, copy, adapt, modify, distribute, license, sell, transfer, 
            publicly display, publicly perform, transmit, broadcast, or exploit any platform content.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">20.9 Force Majeure</h4>
          <p className="text-gray-700 mb-4">
            GoWaay shall not be liable for delays or failures resulting from causes outside reasonable control, 
            including natural disasters, war, terrorism, riots, embargoes, civil or military authority acts, fire, floods, 
            accidents, pandemics, epidemics, strikes, or shortages of transportation, fuel, energy, labor, or materials.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">20.10 Communications</h4>
          <p className="text-gray-700 mb-4">
            You will receive administrative communications using provided contact information. Enrollment in additional 
            email programs will not affect administrative email frequency. You may receive promotional emails; control 
            these using account notification preferences.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">20.11 Currency Conversion</h4>
          <p className="text-gray-700 mb-4">
            GoWaay facilitates transactions in different currencies but may limit available payment currencies. 
            Currency conversions will be processed at the sole discretion of respective payment gateways partnered 
            with GoWaay.
          </p>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">20.12 Dispute Resolution and Arbitration</h4>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-4">
            <p className="text-gray-800 font-semibold mb-3">Dispute Resolution Process:</p>
            <p className="text-gray-700 mb-3">
              Disputes arising from these Terms shall be resolved through a structured process:
            </p>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-3">
              <li>
                <strong>Informal Resolution:</strong> Attempt to resolve disputes amicably through mutual discussions 
                via GoWaay's Complaint Center.
              </li>
              <li>
                <strong>Arbitration:</strong> If informal resolution fails, disputes will be resolved by binding 
                arbitration per the Arbitration Act 2001 (Bangladesh). Arbitration board decisions shall be final 
                and binding.
              </li>
            </ol>
            <p className="text-gray-700">
              You agree to waive any right to pursue litigation other than arbitration for covered disputes. Arbitration 
              decisions are final and conclusive, precluding further litigation outside the specified arbitration process.
            </p>
          </div>

          <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">20.13 Governing Law</h4>
          <p className="text-gray-700 mb-4">
            These Terms & Conditions are governed by the laws of Bangladesh. All interpretation, enforcement, and disputes 
            related to these Terms are subject to Bangladeshi law and the jurisdiction of courts in Dhaka, Bangladesh.
          </p>
        </section>

        {/* Contact Section */}
        <section className="mb-10 bg-gradient-to-r from-red-50 to-pink-50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h3>
          <p className="text-gray-700 mb-4">
            For questions about these Terms & Conditions, please contact us:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-700 mb-2">
                <strong className="text-gray-900">Email:</strong> support@gowaay.com
              </p>
              <p className="text-gray-700 mb-2">
                <strong className="text-gray-900">Phone:</strong> +8801611553628
              </p>
              <p className="text-gray-700">
                <strong className="text-gray-900">WhatsApp:</strong> +8801611553628
              </p>
            </div>
            <div>
              <p className="text-gray-700">
                <strong className="text-gray-900">Address:</strong><br />
                House 37, Road 07, Sector 03<br />
                Uttara, Dhaka-1230<br />
                Bangladesh
              </p>
            </div>
          </div>
        </section>

        {/* Acknowledgment Section */}
        <div className="bg-gray-100 border-2 border-gray-300 p-6 rounded-lg text-center">
          <p className="text-gray-800 font-semibold mb-2">
            By using GoWaay, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
          </p>
          <p className="text-gray-600 text-sm">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
