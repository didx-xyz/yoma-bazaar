import { QueryClient, dehydrate, useQuery } from "@tanstack/react-query";
import { type GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { type ParsedUrlQuery } from "querystring";
import { useState, type ReactElement, useMemo, useCallback } from "react";
import { type OpportunityInfo } from "~/api/models/opportunity";
import { getOpportunityInfoById } from "~/api/services/opportunities";
import MainLayout from "~/components/Layout/Main";
import { authOptions } from "~/server/auth";
import { PageBackground } from "~/components/PageBackground";
import Link from "next/link";
import {
  IoMdArrowRoundBack,
  IoMdCheckmark,
  IoMdClose,
  IoMdFingerPrint,
} from "react-icons/io";
import type { NextPageWithLayout } from "~/pages/_app";
import ReactModal from "react-modal";
import iconAction from "public/images/icon-action.svg";
import iconUpload from "public/images/icon-upload.svg";
import iconOpen from "public/images/icon-open.svg";
import iconClock from "public/images/icon-clock.svg";
import iconUser from "public/images/icon-user.svg";
import iconZlto from "public/images/icon-zlto.svg";
import iconBookmark from "public/images/icon-bookmark.svg";
import iconShare from "public/images/icon-share.svg";
import iconDifficulty from "public/images/icon-difficulty.svg";
import iconLanguage from "public/images/icon-language.svg";
import iconTopics from "public/images/icon-topics.svg";
import iconSkills from "public/images/icon-skills.svg";
import iconRocket from "public/images/icon-rocket.svg";
import iconBell from "public/images/icon-bell.svg";
import iconSmiley from "public/images/icon-smiley.svg";
import Image from "next/image";
import {
  getVerificationStatus,
  saveMyOpportunity,
} from "~/api/services/myOpportunities";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { OpportunityComplete } from "~/components/Opportunity/OpportunityComplete";
import { signIn } from "next-auth/react";
import { fetchClientEnv } from "~/lib/utils";

interface IParams extends ParsedUrlQuery {
  id: string;
  opportunityId: string;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { opportunityId } = context.params as IParams;
  const queryClient = new QueryClient();
  const session = await getServerSession(context.req, context.res, authOptions);

  // UND_ERR_HEADERS_OVERFLOW ISSUE: disable prefetching for now
  //   await queryClient.prefetchQuery(["categories"], async () =>
  //   (await getCategories(context)).map((c) => ({
  //     value: c.id,
  //     label: c.name,
  //   })),
  // );
  // await queryClient.prefetchQuery(["countries"], async () =>
  //   (await getCountries(context)).map((c) => ({
  //     value: c.codeNumeric,
  //     label: c.name,
  //   })),
  // );
  // await queryClient.prefetchQuery(["languages"], async () =>
  //   (await getLanguages(context)).map((c) => ({
  //     value: c.id,
  //     label: c.name,
  //   })),
  // );
  // await queryClient.prefetchQuery(["opportunityTypes"], async () =>
  //   (await getTypes(context)).map((c) => ({
  //     value: c.id,
  //     label: c.name,
  //   })),
  // );
  // await queryClient.prefetchQuery(["verificationTypes"], async () =>
  //   (await getVerificationTypes(context)).map((c) => ({
  //     value: c.id,
  //     label: c.displayName,
  //   })),
  // );
  // await queryClient.prefetchQuery(["difficulties"], async () =>
  //   (await getDifficulties(context)).map((c) => ({
  //     value: c.id,
  //     label: c.name,
  //   })),
  // );
  // await queryClient.prefetchQuery(["timeIntervals"], async () =>
  //   (await getTimeIntervals(context)).map((c) => ({
  //     value: c.id,
  //     label: c.name,
  //   })),
  // );

  if (opportunityId !== "create") {
    await queryClient.prefetchQuery(["opportunityInfo", opportunityId], () =>
      getOpportunityInfoById(opportunityId, context),
    );
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      //user: session?.user ?? null,
      //id: id,
      opportunityId: opportunityId,
    },
  };
}

const OpportunityDetails: NextPageWithLayout<{
  //id: string;
  opportunityId: string;
  //user: User;
}> = ({ opportunityId }) => {
  const [refreshVerificationStatus, setRefreshVerificationStatus] =
    useState(false);
  const [loginDialogVisible, setLoginDialogVisible] = useState(false);
  const [gotoOpportunityDialogVisible, setGotoOpportunityDialogVisible] =
    useState(false);
  const [
    completeOpportunityDialogVisible,
    setCompleteOpportunityDialogVisible,
  ] = useState(false);
  const [
    completeOpportunitySuccessDialogVisible,
    setCompleteOpportunitySuccessDialogVisible,
  ] = useState(false);

  const { data: session } = useSession();

  const { data: opportunity } = useQuery<OpportunityInfo>({
    queryKey: ["opportunityInfo", opportunityId],
    queryFn: () => getOpportunityInfoById(opportunityId),
  });

  const { data: verificationStatus } = useQuery<string | null>({
    queryKey: ["verificationStatus", opportunityId],
    queryFn: () => getVerificationStatus(opportunityId),
    enabled:
      (!!session &&
        !!opportunity &&
        opportunity.verificationEnabled &&
        opportunity.verificationMethod == "Manual") ||
      refreshVerificationStatus,
  });

  // memo for spots left i.e participantLimit - participantCountTotal
  const spotsLeft = useMemo(() => {
    const participantLimit = opportunity?.participantLimit ?? 0;
    const participantCountTotal = opportunity?.participantCountTotal ?? 0;
    return Math.max(participantLimit - participantCountTotal, 0);
  }, [opportunity]);

  const onSaveOpportunity = useCallback(() => {
    if (!session) {
      toast.warning("You need to be logged in to save an opportunity");
      return;
    }

    saveMyOpportunity(opportunityId)
      .then((res) => {
        toast.success("Opportunity saved");
      })
      .catch((err) => {
        toast.error("Error");
      });
  }, [opportunityId, session]);

  const onGoToOpportunity = useCallback(() => {
    if (opportunity?.uRL) window.location.href = opportunity?.uRL;
  }, [opportunity?.uRL]);

  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const onLogin = useCallback(async () => {
    setIsButtonLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    signIn(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ((await fetchClientEnv()).NEXT_PUBLIC_KEYCLOAK_DEFAULT_PROVIDER ||
        "") as string,
    );
  }, [setIsButtonLoading]);

  return (
    <>
      <PageBackground />

      <div className="container z-10 max-w-5xl px-2 py-4">
        <div className="flex flex-col gap-2 py-4 sm:flex-row">
          {/* BREADCRUMB */}
          <div className="breadcrumbs flex-grow overflow-hidden text-ellipsis whitespace-nowrap text-sm">
            <ul>
              <li>
                <Link
                  className="font-bold text-white hover:text-gray"
                  href={`/opportunities`}
                >
                  <IoMdArrowRoundBack className="mr-1 inline-block h-4 w-4" />
                  Opportunities
                </Link>
              </li>
              <li>
                <div className="max-w-[600px]  text-white">
                  {opportunity?.title}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* LOGIN DIALOG */}
        <ReactModal
          isOpen={loginDialogVisible}
          shouldCloseOnOverlayClick={false}
          onRequestClose={() => {
            setLoginDialogVisible(false);
          }}
          className={`fixed bottom-0 left-0 right-0 top-0 flex-grow overflow-hidden bg-white animate-in fade-in md:m-auto md:max-h-[400px] md:w-[600px] md:rounded-3xl`}
          portalClassName={"fixed z-40"}
          overlayClassName="fixed inset-0 bg-overlay"
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-row bg-green p-4 shadow-lg">
              <h1 className="flex-grow"></h1>
              <button
                type="button"
                className="btn rounded-full border-green-dark bg-green-dark p-3 text-white"
                onClick={() => {
                  setLoginDialogVisible(false);
                }}
              >
                <IoMdClose className="h-6 w-6"></IoMdClose>
              </button>
            </div>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="-mt-8 flex h-12 w-12 items-center justify-center rounded-full border-green-dark bg-white shadow-lg">
                <Image
                  src={iconBell}
                  alt="Icon Bell"
                  width={28}
                  height={28}
                  sizes="100vw"
                  priority={true}
                  style={{ width: "28px", height: "28px" }}
                />
              </div>
              <h3>Please login to continue</h3>
              {/* <div className="w-[450px] rounded-lg bg-gray p-4 text-center">
                Remember to <strong>upload your completion certificate</strong>{" "}
                on this page upon finishing to <strong>earn your ZLTO</strong>.
              </div>
              <div>Don’t show me this message again</div>
              <div>
                Be mindful of external sites' privacy policy and keep your data
                private.
              </div> */}
              <div className="mt-4 flex flex-grow gap-4">
                <button
                  type="button"
                  className="btn rounded-full border-purple bg-white normal-case text-purple md:w-[300px]"
                  onClick={() => setLoginDialogVisible(false)}
                >
                  <Image
                    src={iconBookmark}
                    alt="Icon Bookmark"
                    width={20}
                    height={20}
                    sizes="100vw"
                    priority={true}
                    style={{ width: "20px", height: "20px" }}
                  />

                  <span className="ml-1">Cancel</span>
                </button>
                <button
                  type="button"
                  className="btn rounded-full bg-purple normal-case text-white md:w-[250px]"
                  onClick={onLogin}
                >
                  {isButtonLoading && (
                    <span className="loading loading-spinner loading-md mr-2 text-warning"></span>
                  )}
                  {!isButtonLoading && (
                    <IoMdFingerPrint className="h-8 w-8 text-white" />
                  )}
                  <p className="text-white">Login</p>
                </button>
              </div>
            </div>
          </div>
        </ReactModal>

        {/* GO-TO OPPORTUNITY DIALOG */}
        <ReactModal
          isOpen={gotoOpportunityDialogVisible}
          shouldCloseOnOverlayClick={false}
          onRequestClose={() => {
            setGotoOpportunityDialogVisible(false);
          }}
          className={`fixed bottom-0 left-0 right-0 top-0 flex-grow overflow-hidden bg-white animate-in fade-in md:m-auto md:max-h-[450px] md:w-[600px] md:rounded-3xl`}
          portalClassName={"fixed z-40"}
          overlayClassName="fixed inset-0 bg-overlay"
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-row bg-green p-4 shadow-lg">
              <h1 className="flex-grow"></h1>
              <button
                type="button"
                className="btn rounded-full border-green-dark bg-green-dark p-3 text-white"
                onClick={() => {
                  setGotoOpportunityDialogVisible(false);
                }}
              >
                <IoMdClose className="h-6 w-6"></IoMdClose>
              </button>
            </div>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="-mt-8 flex h-12 w-12 items-center justify-center rounded-full border-green-dark bg-white shadow-lg">
                <Image
                  src={iconBell}
                  alt="Icon Bell"
                  width={28}
                  height={28}
                  sizes="100vw"
                  priority={true}
                  style={{ width: "28px", height: "28px" }}
                />
              </div>
              <h3>You are now leaving Yoma</h3>
              <div className="w-[450px] rounded-lg bg-gray p-4 text-center">
                Remember to <strong>upload your completion certificate</strong>{" "}
                on this page upon finishing to <strong>earn your ZLTO</strong>.
              </div>
              <div>Don’t show me this message again</div>
              <div>
                Be mindful of external sites&apos; privacy policy and keep your
                data private.
              </div>
              <div className="mt-4 flex flex-grow gap-4">
                <button
                  type="button"
                  className="btn rounded-full border-purple bg-white normal-case text-purple md:w-[300px]"
                  onClick={onSaveOpportunity}
                >
                  <Image
                    src={iconBookmark}
                    alt="Icon Bookmark"
                    width={20}
                    height={20}
                    sizes="100vw"
                    priority={true}
                    style={{ width: "20px", height: "20px" }}
                  />

                  <span className="ml-1">Save opportunity</span>
                </button>
                <button
                  type="button"
                  className="btn rounded-full bg-purple normal-case text-white md:w-[250px]"
                  onClick={onGoToOpportunity}
                  disabled={!opportunity?.uRL}
                >
                  <Image
                    src={iconOpen}
                    alt="Icon Open"
                    width={20}
                    height={20}
                    sizes="100vw"
                    priority={true}
                    style={{ width: "20px", height: "20px" }}
                  />

                  <span className="ml-1">Proceed</span>
                </button>
              </div>
            </div>
          </div>
        </ReactModal>

        {/* UPLOAD/COMPLETE OPPORTUNITY DIALOG */}
        <ReactModal
          isOpen={completeOpportunityDialogVisible}
          shouldCloseOnOverlayClick={false}
          onRequestClose={() => {
            setCompleteOpportunityDialogVisible(false);
          }}
          className={`fixed bottom-0 left-0 right-0 top-0 flex-grow overflow-y-scroll bg-white animate-in fade-in md:m-auto md:max-h-[600px] md:w-[600px] md:overflow-y-clip md:rounded-3xl`}
          portalClassName={"fixed z-40"}
          overlayClassName="fixed inset-0 bg-overlay"
        >
          <OpportunityComplete
            id="op-complete"
            opportunityInfo={opportunity}
            onClose={() => {
              setCompleteOpportunityDialogVisible(false);
            }}
            onSave={() => {
              setCompleteOpportunityDialogVisible(false);
              setCompleteOpportunitySuccessDialogVisible(true);
              setRefreshVerificationStatus(true);
            }}
          />
        </ReactModal>

        {/* COMPLETE SUCCESS DIALOG */}
        <ReactModal
          isOpen={completeOpportunitySuccessDialogVisible}
          shouldCloseOnOverlayClick={false}
          onRequestClose={() => {
            setCompleteOpportunitySuccessDialogVisible(false);
          }}
          className={`fixed bottom-0 left-0 right-0 top-0 flex-grow overflow-hidden bg-white animate-in fade-in md:m-auto md:max-h-[400px] md:w-[600px] md:rounded-3xl`}
          portalClassName={"fixed z-40"}
          overlayClassName="fixed inset-0 bg-overlay"
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-row bg-green p-4 shadow-lg">
              <h1 className="flex-grow"></h1>
              <button
                type="button"
                className="btn rounded-full border-green-dark bg-green-dark p-3 text-white"
                onClick={() => {
                  setCompleteOpportunitySuccessDialogVisible(false);
                }}
              >
                <IoMdClose className="h-6 w-6"></IoMdClose>
              </button>
            </div>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="-mt-8 flex h-12 w-12 items-center justify-center rounded-full border-green-dark bg-white shadow-lg">
                <Image
                  src={iconSmiley}
                  alt="Icon Smiley"
                  width={28}
                  height={28}
                  sizes="100vw"
                  priority={true}
                  style={{ width: "28px", height: "28px" }}
                />
              </div>
              <h3>Submitted!</h3>
              <div className="w-[450px] rounded-lg p-4 text-center">
                <strong>{opportunity?.organizationName}</strong> is busy
                reviewing your submission. Once approved, the opportunity will
                be automatically added to your CV.
              </div>
              <div className="mt-4 flex flex-grow gap-4">
                <button
                  type="button"
                  className="btn rounded-full border-purple bg-white normal-case text-purple md:w-[200px]"
                  onClick={() =>
                    setCompleteOpportunitySuccessDialogVisible(false)
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ReactModal>

        {opportunity && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-row rounded-lg bg-white p-6">
              <div className="flex flex-grow flex-col ">
                <h4 className="text-black">{opportunity.title}</h4>
                <h6 className="text-gray-dark">
                  By {opportunity.organizationName}
                </h6>
                {/* BADGES */}
                <div className="my-2 flex flex-row gap-1 text-xs font-bold text-green-dark">
                  <div className="badge h-6 whitespace-nowrap rounded-md bg-green-light text-green">
                    <Image
                      src={iconClock}
                      alt="Icon Clock"
                      width={20}
                      height={20}
                      sizes="100vw"
                      priority={true}
                      style={{ width: "20px", height: "20px" }}
                    />

                    <span className="ml-1">{`${opportunity.commitmentIntervalCount} ${opportunity.commitmentInterval}`}</span>
                  </div>

                  {spotsLeft > 0 && (
                    <div className="badge h-6 whitespace-nowrap rounded-md bg-green-light text-green">
                      <Image
                        src={iconUser}
                        alt="Icon User"
                        width={20}
                        height={20}
                        sizes="100vw"
                        priority={true}
                        style={{ width: "20px", height: "20px" }}
                      />
                      <span className="ml-1"> {spotsLeft} spots left</span>
                    </div>
                  )}

                  {(opportunity.zltoReward ?? 0) > 0 && (
                    <div className="badge h-6 whitespace-nowrap rounded-md bg-yellow-light text-yellow">
                      <Image
                        src={iconZlto}
                        alt="Icon Zlto"
                        width={20}
                        height={20}
                        sizes="100vw"
                        priority={true}
                        style={{ width: "20px", height: "20px" }}
                      />
                      <span className="ml-1"> {opportunity.zltoReward}</span>
                    </div>
                  )}
                  <div className="badge h-6 whitespace-nowrap rounded-md bg-purple-light text-purple">
                    <Image
                      src={iconAction}
                      alt="Icon Action"
                      width={20}
                      height={20}
                      sizes="100vw"
                      priority={true}
                      style={{ width: "20px", height: "20px" }}
                    />
                    <span className="ml-1">Action</span>
                  </div>
                </div>
                {/* BUTTONS */}
                <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-2">
                  <div className="flex flex-grow gap-4">
                    <button
                      type="button"
                      className="btn btn-xs rounded-full bg-green normal-case text-white md:btn-sm lg:btn-md md:w-[250px]"
                      onClick={() => setGotoOpportunityDialogVisible(true)}
                    >
                      <Image
                        src={iconOpen}
                        alt="Icon Open"
                        width={20}
                        height={20}
                        sizes="100vw"
                        priority={true}
                        style={{ width: "20px", height: "20px" }}
                      />

                      <span className="ml-1">Go to opportunity</span>
                    </button>

                    {/* only show upload button if verification is enabled and method is manual */}
                    {opportunity.verificationEnabled &&
                      opportunity.verificationMethod == "Manual" && (
                        <>
                          {verificationStatus == null ||
                            (verificationStatus == "Rejected" && (
                              <button
                                type="button"
                                className="btn btn-xs rounded-full border-green bg-white normal-case text-green md:btn-sm lg:btn-md md:w-[300px]"
                                onClick={() =>
                                  session
                                    ? setCompleteOpportunityDialogVisible(true)
                                    : setLoginDialogVisible(true)
                                }
                              >
                                <Image
                                  src={iconUpload}
                                  alt="Icon Upload"
                                  width={20}
                                  height={20}
                                  sizes="100vw"
                                  priority={true}
                                  style={{ width: "20px", height: "20px" }}
                                />

                                <span className="ml-1">
                                  Upload your completion files
                                </span>
                              </button>
                            ))}
                          {verificationStatus != null &&
                            verificationStatus == "Pending" && (
                              <div className="md:text-md flex items-center justify-center whitespace-nowrap rounded-full bg-gray-light px-8 text-center text-xs font-bold text-gray-dark">
                                Pending verification
                              </div>
                            )}
                          {/* {verificationStatus != null &&
                            verificationStatus == "Rejected" && (
                              <div className="flex items-center justify-center rounded-full bg-yellow-light px-8 text-center text-sm font-bold text-warning">
                                Rejected
                              </div>
                            )} */}
                          {verificationStatus != null &&
                            verificationStatus == "Completed" && (
                              <div className="md:text-md flex items-center justify-center rounded-full border border-purple bg-white px-4 text-center text-xs font-bold text-purple">
                                Completed
                                <IoMdCheckmark
                                  strikethroughThickness={2}
                                  overlineThickness={2}
                                  underlineThickness={2}
                                  className="ml-1 h-4 w-4 text-green"
                                />
                              </div>
                            )}
                        </>
                      )}

                    {/* TODO: */}
                    {opportunity.verificationEnabled &&
                      opportunity.verificationMethod == "Automatic" && (
                        <button
                          type="button"
                          className="btn btn-xs rounded-full border-green bg-white normal-case text-green md:btn-sm lg:btn-md md:w-[300px]"
                          onClick={() =>
                            session
                              ? setCompleteOpportunityDialogVisible(true)
                              : setLoginDialogVisible(true)
                          }
                        >
                          <Image
                            src={iconUpload}
                            alt="Icon Upload"
                            width={20}
                            height={20}
                            sizes="100vw"
                            priority={true}
                            style={{ width: "20px", height: "20px" }}
                          />

                          <span className="ml-1">Mark as completed</span>
                        </button>
                      )}
                  </div>
                  <div className="flex gap-4 lg:justify-end">
                    <button
                      type="button"
                      className="btn btn-xs rounded-full border-gray-dark bg-white normal-case text-gray-dark md:btn-sm lg:btn-md md:w-[100px]"
                    >
                      <Image
                        src={iconBookmark}
                        alt="Icon Bookmark"
                        width={20}
                        height={20}
                        sizes="100vw"
                        priority={true}
                        style={{ width: "20px", height: "20px" }}
                      />

                      <span className="ml-1">Save</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-xs rounded-full border-gray-dark bg-white normal-case text-gray-dark md:btn-sm lg:btn-md md:w-[110px]"
                    >
                      <Image
                        src={iconShare}
                        alt="Icon Share"
                        width={20}
                        height={20}
                        sizes="100vw"
                        priority={true}
                        style={{ width: "20px", height: "20px" }}
                      />

                      <span className="ml-1">Share</span>
                    </button>
                  </div>
                </div>
              </div>
              {/* LOGO */}
              <div>
                <Image
                  src={opportunity?.organizationLogoURL ?? iconRocket}
                  alt="Icon Open"
                  width={160}
                  height={80}
                  sizes="100vw"
                  priority={true}
                  style={{ width: "80px", height: "80px" }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:flex-row">
              <div className="flex-grow rounded-lg bg-white p-6 md:w-[66%]">
                {opportunity?.description}
              </div>
              <div className="flex flex-col gap-2 md:w-[33%]">
                <div className="flex flex-col gap-1 rounded-lg bg-white p-6">
                  <div>
                    <div className="flex flex-row items-center gap-1 text-sm font-bold">
                      <Image
                        src={iconSkills}
                        alt="Icon Skills"
                        width={20}
                        height={20}
                        sizes="100vw"
                        priority={true}
                        style={{ width: "20px", height: "20px" }}
                      />

                      <span className="ml-1">Skills you will learn</span>
                    </div>
                    <div className="my-2">
                      {opportunity?.skills?.map((item) => (
                        <div
                          key={item.id}
                          className="badge mr-2 h-6 rounded-md border-0 bg-green text-white"
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="divider mt-1" />
                  <div>
                    <div className="flex flex-row items-center gap-1 text-sm font-bold">
                      <Image
                        src={iconClock}
                        alt="Icon Clock"
                        width={20}
                        height={20}
                        sizes="100vw"
                        priority={true}
                        style={{ width: "20px", height: "20px" }}
                      />

                      <span className="ml-1">How much time you will need</span>
                    </div>
                    <div className="my-2">{`${opportunity?.commitmentIntervalCount} ${opportunity?.commitmentInterval}`}</div>
                  </div>
                  <div className="divider mt-1" />
                  <div>
                    <div className="flex flex-row items-center gap-1 text-sm font-bold">
                      <Image
                        src={iconTopics}
                        alt="Icon Topics"
                        width={20}
                        height={20}
                        sizes="100vw"
                        priority={true}
                        style={{ width: "20px", height: "20px" }}
                      />

                      <span className="ml-1">Topics</span>
                    </div>
                    <div className="my-2">
                      {opportunity?.categories?.map((item) => (
                        <div
                          key={item.id}
                          className="badge mr-2 h-6 rounded-md bg-green text-white"
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="divider mt-1" />
                  <div>
                    <div className="flex flex-row items-center gap-1 text-sm font-bold">
                      <Image
                        src={iconLanguage}
                        alt="Icon Language"
                        width={20}
                        height={20}
                        sizes="100vw"
                        priority={true}
                        style={{ width: "20px", height: "20px" }}
                      />

                      <span className="ml-1">Languages</span>
                    </div>
                    <div className="my-2">
                      {opportunity?.languages?.map((item) => (
                        <div
                          key={item.id}
                          className="badge mr-2 h-6 rounded-md bg-green text-white"
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="divider mt-1" />
                  <div>
                    <div className="flex flex-row items-center gap-1 text-sm font-bold">
                      <Image
                        src={iconDifficulty}
                        alt="Icon Difficulty"
                        width={20}
                        height={20}
                        sizes="100vw"
                        priority={true}
                        style={{ width: "20px", height: "20px" }}
                      />

                      <span className="ml-1">Course difficulty</span>
                    </div>
                    <div className="my-2">{opportunity?.difficulty}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

OpportunityDetails.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default OpportunityDetails;