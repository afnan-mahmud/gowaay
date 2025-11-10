export default function RefundPolicy() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
      <p className="text-xl text-gray-600 mb-8">Our refund terms and how refunds are processed</p>
      
      <div className="prose prose-gray max-w-none">
        
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-600 p-6 mb-10 rounded-r-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Guest Refund & Cancellation Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            These terms and conditions outline GoWaay's policy for Guest refunds and the responsibilities of 
            Hosts in connection with the Guest Refund Policy. This Guest Refund Policy is applicable in addition 
            to GoWaay's Terms & Conditions. The Guest Refund Policy is available to Guests who book and pay 
            for an Accommodation through the GoWaay Platform and experience a Booking Issue (as defined below). 
            The Guest's rights under this Guest Refund Policy take precedence over the Host's cancellation policy.
          </p>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        
        <p className="text-gray-700 mb-8 leading-relaxed">
          All capitalized terms shall have the meaning set forth in the GoWaay Terms & Conditions unless 
          otherwise defined in this Guest Refund Policy.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-10 rounded-r-lg">
          <p className="text-gray-800 font-semibold mb-3">Agreement to Policy:</p>
          <p className="text-gray-700">
            By using the GoWaay Platform as a Host or Guest, you confirm that you have read, understood, 
            and agree to be bound by this Guest Refund Policy.
          </p>
        </div>

        {/* Section 1: Booking Issue Definition */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">1. BOOKING ISSUE</h2>
          </div>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            A <strong>"Booking Issue"</strong> refers to any one of the following circumstances:
          </p>

          <div className="space-y-6">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">(a) Host Non-Performance</h3>
              <p className="text-gray-700 mb-3">A Booking Issue exists when the Host of the Accommodation:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  <strong>(i)</strong> Cancels a booking shortly before the scheduled check-in time, or
                </li>
                <li>
                  <strong>(ii)</strong> Fails to provide the Guest with reasonable access to the Accommodation 
                  (e.g., does not provide keys, security codes, gate access, or entry instructions).
                </li>
              </ul>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">(b) Inaccurate Listing Description</h3>
              <p className="text-gray-700 mb-3">
                A Booking Issue exists when the Listing's description or representation of the Accommodation is 
                materially inaccurate with respect to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-3">
                <li>
                  The size and configuration of the Accommodation (e.g., number and dimensions of bedrooms, 
                  bathrooms, kitchen, living areas, or other rooms);
                </li>
                <li>
                  Whether the booking is for an entire home, private room, or shared room, and whether another 
                  party (including the Host) is occupying the Accommodation during the booking period;
                </li>
                <li>
                  Special amenities or features advertised in the Listing are unavailable or non-functional, 
                  such as balconies, terraces, swimming pools, hot tubs, bathrooms (toilet/shower/bathtub), 
                  kitchen facilities (sink/stove/refrigerator or major appliances), electrical systems, heating, 
                  air conditioning, Wi-Fi, or other essential utilities.
                </li>
              </ul>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">(c) Cleanliness and Safety Issues</h3>
              <p className="text-gray-700 mb-3">
                A Booking Issue exists when, at the start of the Guest's booking, the Accommodation:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-3">
                <li>
                  <strong>(i)</strong> Is not generally clean and sanitary (including but not limited to unclean 
                  bedding, bathroom towels, floors, kitchen surfaces, or common areas);
                </li>
                <li>
                  <strong>(ii)</strong> Contains safety or health hazards that would reasonably be expected to 
                  adversely affect the Guest's stay at the Accommodation, in GoWaay's judgment;
                </li>
                <li>
                  <strong>(iii)</strong> Has vermin, pests, or contains pets that were not disclosed in the Listing.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: The Guest Refund Policy */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">2. THE GUEST REFUND POLICY</h2>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6 rounded-r-lg">
            <p className="text-gray-800 font-semibold mb-2">Important Notice:</p>
            <p className="text-gray-700">
              This Guest Refund Policy applies uniformly to all bookings made through the GoWaay Platform 
              and supersedes any other cancellation terms.
            </p>
          </div>

          <p className="text-gray-700 mb-8 text-lg leading-relaxed">
            GoWaay operates a simple and transparent refund policy. All refunds will be processed within 
            <strong> 2-3 working days</strong> of the refund approval date.
          </p>

          {/* Standard Refund Policy */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-3 border-blue-400 rounded-xl p-8 shadow-lg">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-md">
                Standard Cancellation Policy
              </div>
            </div>
            
            <div className="space-y-6">
              {/* 80% Refund Section */}
              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-300">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-600 text-white font-bold text-2xl shadow-lg">
                      80%
                    </div>
                  </div>
                  <div className="ml-6 flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">80% Refund Available</h3>
                    <p className="text-gray-700 text-lg mb-3">
                      Guests can request a cancellation and receive an <strong>80% refund</strong> of the total booking amount 
                      if the cancellation is made <strong>at least 24 hours before the scheduled check-in time</strong>.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <p className="text-gray-700 font-semibold mb-2">How it works:</p>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        <li>You receive <strong>80%</strong> of your total payment back</li>
                        <li>GoWaay retains <strong>20%</strong> as a platform service fee</li>
                        <li>Refund is credited to your original payment method within 2-3 working days</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* No Refund Section */}
              <div className="bg-white rounded-xl p-6 shadow-md border-2 border-red-300">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-600 text-white font-bold text-2xl shadow-lg">
                      0%
                    </div>
                  </div>
                  <div className="ml-6 flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Refund Available</h3>
                    <p className="text-gray-700 text-lg mb-3">
                      <strong>No refund will be issued</strong> if the cancellation request is made <strong>within 24 hours 
                      of the scheduled check-in time</strong> or after check-in has occurred.
                    </p>
                    <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                      <p className="text-gray-700 font-semibold mb-2">Important:</p>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        <li>Cancellations within 24 hours of check-in are <strong>non-refundable</strong></li>
                        <li>The full booking amount will be charged</li>
                        <li>This policy helps protect hosts from last-minute cancellations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="mt-8 bg-gradient-to-r from-green-100 via-yellow-100 to-red-100 rounded-lg p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">Cancellation Timeline</h4>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="bg-green-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-2 font-bold text-xl shadow-lg">
                    80%
                  </div>
                  <p className="text-sm font-semibold text-gray-800">More than 24 hours</p>
                  <p className="text-xs text-gray-600">before check-in</p>
                </div>
                <div className="flex-shrink-0 px-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="text-center flex-1">
                  <div className="bg-red-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-2 font-bold text-xl shadow-lg">
                    0%
                  </div>
                  <p className="text-sm font-semibold text-gray-800">Within 24 hours</p>
                  <p className="text-xs text-gray-600">of check-in</p>
                </div>
              </div>
            </div>
          </div>

          {/* Examples Section */}
          <div className="mt-8 bg-white border-2 border-gray-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Examples:</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <p className="text-gray-700">
                    <strong>Example 1:</strong> Check-in is on Friday at 2:00 PM. You cancel on Thursday at 1:00 PM. 
                    <span className="text-green-600 font-semibold"> → You receive 80% refund.</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <p className="text-gray-700">
                    <strong>Example 2:</strong> Check-in is on Monday at 3:00 PM. You cancel on Sunday at 2:00 PM. 
                    <span className="text-green-600 font-semibold"> → You receive 80% refund.</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">❌</span>
                <div>
                  <p className="text-gray-700">
                    <strong>Example 3:</strong> Check-in is on Friday at 2:00 PM. You cancel on Friday at 10:00 AM. 
                    <span className="text-red-600 font-semibold"> → No refund (within 24 hours).</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">❌</span>
                <div>
                  <p className="text-gray-700">
                    <strong>Example 4:</strong> Check-in is on Saturday at 12:00 PM. You cancel on Friday at 2:00 PM. 
                    <span className="text-red-600 font-semibold"> → No refund (within 24 hours).</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Duration Notice */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-400 rounded-lg p-6 mt-8">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900">Refund Processing Time</h3>
            </div>
            <p className="text-gray-700 text-lg">
              All approved refunds will be processed and sent within <strong>2-3 working days</strong> 
              of the refund approval date. The refund will be credited to the original payment method used during booking.
            </p>
          </div>
        </section>

        {/* Section 3: Conditions for Making a Claim */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">3. CONDITIONS FOR MAKING A CLAIM</h2>
          </div>
          
          <p className="text-gray-700 mb-6">
            To submit a valid claim for a Booking Issue and receive the benefits associated with your booking, 
            you are required to meet <strong>each</strong> of the following conditions:
          </p>

          <div className="space-y-4">
            <div className="bg-white border-l-4 border-blue-500 rounded-r-lg p-5 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                    a
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Guest Identity Verification</h4>
                  <p className="text-gray-700">
                    You must be the Guest who originally booked the Accommodation through the GoWaay Platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-l-4 border-blue-500 rounded-r-lg p-5 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                    b
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Timely Reporting</h4>
                  <p className="text-gray-700 mb-3">
                    You must report the Booking Issue to us in writing (via email or through the Platform) or by 
                    telephone <strong>within 24 hours</strong> of discovering the Booking Issue.
                  </p>
                  <p className="text-gray-700">
                    You must provide us with comprehensive information about the Accommodation and the circumstances 
                    of the Booking Issue, including but not limited to photographs, videos, or other written or 
                    tangible evidence.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-l-4 border-blue-500 rounded-r-lg p-5 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                    c
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Cooperation with Investigation</h4>
                  <p className="text-gray-700">
                    You must respond promptly to any requests by GoWaay for additional information, 
                    documentation, or cooperation regarding the Booking Issue within the timeframe specified by 
                    GoWaay.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-l-4 border-blue-500 rounded-r-lg p-5 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                    d
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 mb-2">No Guest Fault</h4>
                  <p className="text-gray-700">
                    You must not have directly or indirectly caused the Booking Issue through your own action, 
                    omission, or negligence.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-l-4 border-blue-500 rounded-r-lg p-5 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                    e
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Good Faith Resolution Attempt</h4>
                  <p className="text-gray-700">
                    Unless otherwise specified by GoWaay or GoWaay advises you that the Booking Issue 
                    cannot be remediated, you must use reasonable and good faith efforts to attempt to resolve 
                    the circumstances of the Booking Issue with the Host before escalating the claim.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-l-4 border-red-500 rounded-r-lg p-5 shadow-sm bg-red-50">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-700 font-bold">
                    f
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Vacation Requirement for Full Refund</h4>
                  <p className="text-gray-700 mb-3">
                    In order to receive a reimbursement or assistance with booking an alternative Accommodation, 
                    you must agree to vacate the Accommodation.
                  </p>
                  <p className="text-gray-700 font-semibold">
                    Important: If you choose to remain in the Accommodation, you may not qualify for a partial 
                    refund at GoWaay's discretion as described in this policy (regardless of whether you 
                    reported the Booking Issue within 24 hours after check-in).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Host Responsibilities */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">4. MINIMUM QUALITY STANDARDS, HOST RESPONSIBILITIES, AND REIMBURSEMENT</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4.1 Host Quality Standards</h3>
              <p className="text-gray-700 mb-4">
                If you are a Host, you are responsible for ensuring that the Accommodations you list on the 
                GoWaay Platform meet the following standards:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Are accessible and available to Guests as described</li>
                <li>Are adequately and accurately described in the Listing</li>
                <li>Are safe, clean, and sanitary</li>
                <li>Do not present Guests with Booking Issues as specified in these terms</li>
              </ul>
              <p className="text-gray-700 mb-4">
                During a Guest's stay at an Accommodation, Hosts must be available (or make a designated 
                third-party available) to attempt, in good faith, to resolve any Booking Issues or other 
                Guest concerns that may arise.
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4.2 Host Reimbursement Obligation</h3>
              <p className="text-gray-700 mb-4">
                If you are a Host, and if:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>
                  <strong>(i)</strong> GoWaay determines that a Guest has suffered a Booking Issue related 
                  to an Accommodation listed by you, and
                </li>
                <li>
                  <strong>(ii)</strong> GoWaay reimburses that Guest (up to their Total Fees),
                </li>
              </ul>
              <p className="text-gray-700 font-semibold">
                You authorize GoWaay to collect any amounts owed to GoWaay by reducing your future 
                payouts or as otherwise permitted pursuant to the Terms & Conditions and Host Agreement.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4.3 Host Dispute Process</h3>
              <p className="text-gray-700 mb-4">
                As a Host, you understand that the rights of Guests under this Guest Refund Policy take 
                precedence over your selected cancellation policy.
              </p>
              <p className="text-gray-700 mb-4">
                If you wish to dispute a Booking Issue claim, you may notify us in writing (via email or 
                through the Platform) or by telephone and provide us with comprehensive information 
                (including photographs, videos, or other evidence) disputing the claims regarding the 
                Booking Issue.
              </p>
              <p className="text-gray-700 font-semibold">
                In order to dispute a Booking Issue, you must use reasonable and good faith efforts to 
                attempt to remedy any Booking Issue with the Guest, unless GoWaay advises you that 
                the Booking Issue cannot be remediated or the Guest has already vacated the Accommodation.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: General Provisions */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-gray-100 to-slate-100 p-6 rounded-lg mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">5. GENERAL PROVISIONS</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5.1 Modification or Termination</h3>
              <p className="text-gray-700 mb-4">
                GoWaay reserves the right to modify, supplement, or terminate this Guest Refund Policy 
                at any time, in its sole discretion.
              </p>
              <p className="text-gray-700 mb-4">
                If GoWaay modifies this Guest Refund Policy, we will post the modification on the 
                GoWaay Platform or provide you with notice of the modification. GoWaay will continue 
                to process all claims for Booking Issues made prior to the effective date of the modification 
                according to the policy that was in effect at the time the claim was submitted.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5.2 Entire Agreement</h3>
              <p className="text-gray-700 mb-4">
                This Guest Refund Policy constitutes the entire and exclusive understanding and agreement 
                between GoWaay and you regarding refunds and cancellations. This policy supersedes and 
                replaces any and all prior oral or written understandings or agreements between GoWaay 
                and you regarding the Guest Refund Policy.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5.3 Governing Law</h3>
              <p className="text-gray-700 mb-4">
                This Guest Refund Policy is subject to the applicable laws of Bangladesh and the specific 
                region in which the Platform is accessed or the Services are utilized.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-8 rounded-lg border-2 border-red-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact GoWaay</h2>
            
            <p className="text-gray-700 mb-6">
              If you have any questions about the Guest Refund Policy or need to report a Booking Issue, 
              please contact us:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Primary Contact</h3>
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
              
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Our Office</h3>
                <p className="text-gray-700">
                  House 37, Road 07, Sector 03<br />
                  Uttara, Dhaka-1230<br />
                  Bangladesh
                </p>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <p className="text-gray-700 text-sm mb-2">
                <strong>⏰ Response Time:</strong> For Booking Issue claims, our support team aims to respond 
                within <strong>4-6 hours</strong> during business hours (9 AM - 10 PM Bangladesh Time, 7 days a week).
              </p>
              <p className="text-gray-700 text-sm">
                <strong>🚨 Emergency Issues:</strong> For urgent matters requiring immediate attention 
                (such as inability to access accommodation), please call us directly at +8801611553628.
              </p>
            </div>
            
            <p className="text-gray-700 mt-6 text-center font-medium">
              We are committed to resolving all issues fairly and promptly!
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="bg-gray-100 border-2 border-gray-300 p-6 rounded-lg text-center mt-10">
          <p className="text-gray-600 text-sm mb-2">
            © {new Date().getFullYear()} GoWaay. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs">
            This Refund Policy is part of our Terms & Conditions and should be read in conjunction with them.
          </p>
        </div>
      </div>
    </div>
  );
}
