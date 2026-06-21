import DemoBankForm from "@/components/DemoBankForm";
import HeaderBox from "@/components/HeaderBox";
import { getLoggedInUser } from "@/lib/actions/user.actions";

const DemoBankPage = async () => {
  const user = await getLoggedInUser();

  return (
    <section className="space-y-6">
      <HeaderBox
        title="Demo Banks"
        subtext="Create additional demo bank accounts."
      />

      <DemoBankForm userId={user.$id} />
    </section>
  );
};

export default DemoBankPage;
